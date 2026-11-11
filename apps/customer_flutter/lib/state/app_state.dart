import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models.dart';

const bool kLaunchFreeFees = true;
const int kCreditBalance = 15000;
const double kGstRate = 0.05;

class CartLine {
  final String id, itemId, brandId, name;
  final Veg veg;
  final int unitPrice, mrp;
  final List<AddonOption> addons;
  int qty;
  CartLine(this.id, this.itemId, this.brandId, this.name, this.veg,
      this.unitPrice, this.mrp, this.addons, this.qty);
  int get addonTotal => addons.fold(0, (a, x) => a + x.price);
}

class Totals {
  final int itemTotal, mrpTotal, packaging, packagingBase, delivery, deliveryBase;
  final bool feesWaived;
  final int discount, credits, tip, tax, savings, payable;
  Totals(this.itemTotal, this.mrpTotal, this.packaging, this.packagingBase,
      this.delivery, this.deliveryBase, this.feesWaived, this.discount,
      this.credits, this.tip, this.tax, this.savings, this.payable);
}

class CartState extends ChangeNotifier {
  final List<CartLine> lines = [];
  String? brandId;
  String? coupon;
  bool useCredits = false;
  int tip = 0;

  int get count => lines.fold(0, (n, l) => n + l.qty);

  String _sig(String itemId, List<AddonOption> a) {
    final ids = a.map((x) => x.id).toList()..sort();
    return '$itemId::${ids.join(",")}';
  }

  void add(Dish dish, int price, int mrp, {List<AddonOption> addons = const []}) {
    if (brandId != null && brandId != dish.brandId) {
      lines.clear();
    }
    final sig = _sig(dish.id, addons);
    final existing = lines.where((l) => l.id == sig).firstOrNull;
    if (existing != null) {
      existing.qty += 1;
    } else {
      lines.add(CartLine(sig, dish.id, dish.brandId, dish.name, dish.veg,
          price, mrp, addons, 1));
    }
    brandId = dish.brandId;
    notifyListeners();
  }

  void setQty(String id, int qty) {
    final l = lines.where((x) => x.id == id).firstOrNull;
    if (l == null) return;
    if (qty <= 0) {
      lines.removeWhere((x) => x.id == id);
      if (lines.isEmpty) brandId = null;
    } else {
      l.qty = qty;
    }
    notifyListeners();
  }

  int simpleQty(String itemId) =>
      lines.where((l) => l.id == '$itemId::').firstOrNull?.qty ?? 0;

  void clear() {
    lines.clear();
    brandId = null;
    coupon = null;
    useCredits = false;
    tip = 0;
    notifyListeners();
  }

  String? applyCoupon(String codeRaw) {
    final code = codeRaw.trim().toUpperCase();
    final def = coupons[code];
    if (def == null) return 'Invalid coupon code';
    final it = _itemTotal();
    if (it < def.min) return 'Add ₹${((def.min - it) / 100).ceil()} more to use this coupon';
    coupon = code;
    notifyListeners();
    return null;
  }

  void removeCoupon() {
    coupon = null;
    notifyListeners();
  }

  void setTip(int v) {
    tip = v;
    notifyListeners();
  }

  void toggleCredits() {
    useCredits = !useCredits;
    notifyListeners();
  }

  int _itemTotal() =>
      lines.fold(0, (s, l) => s + (l.unitPrice + l.addonTotal) * l.qty);
  int _mrpTotal() =>
      lines.fold(0, (s, l) => s + (l.mrp + l.addonTotal) * l.qty);

  Totals totals() {
    final itemTotal = _itemTotal();
    final mrpTotal = _mrpTotal();
    final packagingBase = lines.isEmpty ? 0 : kZone.packagingFee;
    final deliveryBase = (lines.isEmpty || itemTotal >= kZone.freeDeliveryThreshold)
        ? 0
        : kZone.deliveryFee;
    final feesWaived = kLaunchFreeFees && lines.isNotEmpty;
    final packaging = feesWaived ? 0 : packagingBase;
    final delivery = feesWaived ? 0 : deliveryBase;
    final def = coupon != null ? coupons[coupon] : null;
    final discount = (def != null && itemTotal >= def.min) ? def.calc(itemTotal) : 0;
    final tax = (itemTotal * kGstRate).round();
    final beforeCredits = itemTotal + packaging + delivery + tax - discount + tip;
    final credits = useCredits
        ? kCreditBalance.clamp(0, (beforeCredits - 100).clamp(0, kCreditBalance))
        : 0;
    final payable = beforeCredits - credits;
    final savings = (mrpTotal - itemTotal) +
        discount +
        credits +
        (packagingBase - packaging) +
        (deliveryBase - delivery);
    return Totals(itemTotal, mrpTotal, packaging, packagingBase, delivery,
        deliveryBase, feesWaived, discount, credits, tip, tax, savings, payable);
  }
}

class ZoneState extends ChangeNotifier {
  Zone zone = kZone;
  String? address;
  String status = 'loading'; // loading | ready | denied

  Future<void> locate() async {
    status = 'loading';
    notifyListeners();
    try {
      var perm = await Geolocator.checkPermission();
      if (perm == LocationPermission.denied) {
        perm = await Geolocator.requestPermission();
      }
      if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
        status = 'denied';
        notifyListeners();
        return;
      }
      final pos = await Geolocator.getCurrentPosition();
      try {
        final uri = Uri.parse(
            'https://nominatim.openstreetmap.org/reverse?format=json&zoom=16&lat=${pos.latitude}&lon=${pos.longitude}');
        final res = await http
            .get(uri, headers: {'User-Agent': 'DishPop/0.1'}).timeout(const Duration(seconds: 6));
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body) as Map<String, dynamic>;
          final a = (data['address'] as Map?) ?? {};
          final parts = [
            a['suburb'] ?? a['neighbourhood'] ?? a['residential'],
            a['city'] ?? a['town'] ?? a['state_district'],
          ].where((x) => x != null && '$x'.isNotEmpty).take(2).toList();
          if (parts.isNotEmpty) address = parts.join(', ');
        }
      } catch (_) {}
      status = 'ready';
      notifyListeners();
    } catch (_) {
      status = 'ready';
      notifyListeners();
    }
  }
}

class AuthUser {
  final String phone;
  final String? name;
  AuthUser(this.phone, this.name);
  Map<String, dynamic> toJson() => {'phone': phone, 'name': name};
  factory AuthUser.fromJson(Map<String, dynamic> j) =>
      AuthUser(j['phone'] as String, j['name'] as String?);
}

const String kDevOtp = '123456';

class AuthState extends ChangeNotifier {
  AuthUser? user;
  bool get signedIn => user != null;

  Future<void> restore() async {
    final sp = await SharedPreferences.getInstance();
    final raw = sp.getString('dishpop.user');
    if (raw != null) {
      user = AuthUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
      notifyListeners();
    }
  }

  Future<void> _persist() async {
    final sp = await SharedPreferences.getInstance();
    if (user != null) {
      await sp.setString('dishpop.user', jsonEncode(user!.toJson()));
    } else {
      await sp.remove('dishpop.user');
    }
  }

  String? verify(String phone, String code) {
    if (code != kDevOtp) return 'Incorrect OTP. Try again.';
    user = AuthUser(phone, null);
    _persist();
    notifyListeners();
    return null;
  }

  void setName(String name) {
    if (user != null) {
      user = AuthUser(user!.phone, name);
      _persist();
      notifyListeners();
    }
  }

  void signOut() {
    user = null;
    _persist();
    notifyListeners();
  }
}

const orderStages = [
  ('Order confirmed', 'Sent to the kitchen'),
  ('Preparing your food', 'The kitchen is cooking'),
  ('Food packed', 'Sealed and ready'),
  ('Rider picked up', 'On the way to you'),
  ('Rider nearby', 'Almost at your door'),
  ('Delivered', 'Enjoy your meal'),
];

class PlacedOrder {
  final String id, brandName, address, paymentMethod, riderName;
  final List<(String, int)> items; // name, qty
  final int payable, etaMinutes;
  int stage;
  PlacedOrder(this.id, this.brandName, this.items, this.payable, this.address,
      this.paymentMethod, this.etaMinutes, this.riderName, this.stage);
}

class OrdersState extends ChangeNotifier {
  final List<PlacedOrder> orders = [];
  PlacedOrder? byId(String id) => orders.where((o) => o.id == id).firstOrNull;

  String place(String brandName, List<(String, int)> items, int payable,
      String address, String paymentMethod, int eta) {
    final id = 'DP${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
    final riders = ['Imran', 'Suresh', 'Anil'];
    final o = PlacedOrder(id, brandName, items, payable, address, paymentMethod,
        eta, riders[DateTime.now().second % 3], 0);
    orders.insert(0, o);
    notifyListeners();
    _advance(o);
    return id;
  }

  void _advance(PlacedOrder o) {
    Future.delayed(const Duration(seconds: 6), () {
      if (o.stage < orderStages.length - 1) {
        o.stage += 1;
        notifyListeners();
        _advance(o);
      }
    });
  }
}

extension FirstOrNullX<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
}
