// Core data model + mock data. Money is integer paise everywhere.

String rupees(int paise) {
  final whole = paise ~/ 100;
  final frac = (paise % 100).abs();
  final s = whole.toString().replaceAllMapped(
      RegExp(r'(\d)(?=(\d{2})+(\d)(?!\d))(?!\d*\.)'), (m) => '${m[1]},');
  return frac == 0 ? '₹$s' : '₹$s.${frac.toString().padLeft(2, '0')}';
}

enum Veg { veg, nonVeg, egg }

class Brand {
  final String id, name, tagline, cuisine, banner;
  final double rating;
  const Brand(this.id, this.name, this.tagline, this.cuisine, this.banner, this.rating);
}

class AddonOption {
  final String id, name;
  final int price;
  const AddonOption(this.id, this.name, this.price);
}

class AddonGroup {
  final String id, name;
  final int min, max;
  final List<AddonOption> options;
  const AddonGroup(this.id, this.name, this.min, this.max, this.options);
}

class Dish {
  final String id, brandId, name, description, image, category;
  final Veg veg;
  final List<String> tags; // bestseller, new, spicy, popular
  final List<AddonGroup> addons;
  const Dish(this.id, this.brandId, this.name, this.description, this.image,
      this.category, this.veg, this.tags, this.addons);
}

class Offering {
  final String itemId;
  final int price, mrp;
  final bool available;
  const Offering(this.itemId, this.price, this.mrp, this.available);
}

class Kitchen {
  final String legalName, fssai;
  const Kitchen(this.legalName, this.fssai);
}

class Zone {
  final String id, name;
  final int deliveryFee, packagingFee, freeDeliveryThreshold, minOrderValue, etaMinutes;
  const Zone(this.id, this.name, this.deliveryFee, this.packagingFee,
      this.freeDeliveryThreshold, this.minOrderValue, this.etaMinutes);
}

// ---- Mock data ----
const kZone = Zone('z-kor', 'Koramangala 4th Block', 2900, 1500, 29900, 9900, 32);
const kKitchen = Kitchen('Spice Hub Foods Pvt Ltd', '11223344556677');

const brands = <Brand>[
  Brand('b-box30', 'Box 30', 'Hearty Indian meals in 30',
      'North Indian • Thalis • Rice Bowls', 'assets/food/box30-banner.jpg', 4.3),
  Brand('b-mojopop', 'Mojo Pop', 'Snacks, burgers & late-night bites',
      'Burgers • Fries • Beverages', 'assets/food/mojopop-banner.jpg', 4.1),
];

const dishes = <Dish>[
  Dish('i-paneer-thali', 'b-box30', 'Paneer Butter Masala Thali',
      'Paneer butter masala, dal, 3 rotis, rice, salad, sweet.',
      'assets/food/paneer-thali.jpg', 'Thalis', Veg.veg, ['bestseller'], [
    AddonGroup('ag-extra', 'Add extras', 0, 3, [
      AddonOption('o-roti', 'Extra roti', 1500),
      AddonOption('o-gulab', 'Gulab jamun (2)', 4000),
    ])
  ]),
  Dish('i-chicken-bowl', 'b-box30', 'Chicken Biryani Bowl',
      'Hyderabadi-style chicken biryani with raita.',
      'assets/food/chicken-bowl.jpg', 'Rice Bowls', Veg.nonVeg, ['popular', 'spicy'], []),
  Dish('i-classic-burger', 'b-mojopop', 'Classic Chicken Burger',
      'Crispy chicken patty, lettuce, house sauce.',
      'assets/food/classic-burger.jpg', 'Burgers', Veg.nonVeg, ['bestseller'], [
    AddonGroup('ag-drink', 'Choose a drink', 1, 1, [
      AddonOption('o-coke', 'Cola (300ml)', 4000),
      AddonOption('o-lime', 'Fresh lime soda', 5000),
    ])
  ]),
  Dish('i-fries', 'b-mojopop', 'Peri Peri Fries', 'Crinkle-cut fries tossed in peri peri.',
      'assets/food/fries.jpg', 'Sides', Veg.veg, ['new'], []),
];

const offerings = <String, Offering>{
  'i-paneer-thali': Offering('i-paneer-thali', 19900, 24900, true),
  'i-chicken-bowl': Offering('i-chicken-bowl', 22900, 22900, true),
  'i-classic-burger': Offering('i-classic-burger', 16900, 19900, true),
  'i-fries': Offering('i-fries', 9900, 9900, false),
};

// ---- Catalog helpers ----
Brand? brandById(String id) => brands.where((b) => b.id == id).firstOrNull;
Dish? dishById(String id) => dishes.where((d) => d.id == id).firstOrNull;
Offering? offeringFor(String id) => offerings[id];

List<Brand> brandsInZone() => brands;
List<Dish> dishesInZone() => dishes;

extension on Iterable<Brand> {
  Brand? get firstOrNull => isEmpty ? null : first;
}

// ---- Coupons ----
class Coupon {
  final String code, label;
  final int min;
  final int Function(int itemTotal) calc;
  const Coupon(this.code, this.label, this.min, this.calc);
}

final coupons = <String, Coupon>{
  'FIRST50': Coupon('FIRST50', '50% off your first 3 orders, up to ₹150', 9900,
      (it) => (it * 0.5).round().clamp(0, 15000)),
  'DISH25': Coupon('DISH25', '25% off, up to ₹120', 9900,
      (it) => (it * 0.25).round().clamp(0, 12000)),
  'GET100': Coupon('GET100', 'Flat ₹100 off over ₹299', 29900, (it) => 10000),
};
