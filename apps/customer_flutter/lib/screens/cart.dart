import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});
  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _couponCtrl = TextEditingController();
  String? _couponError;
  bool _couponOpen = false;

  @override
  void dispose() {
    _couponCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartState>();
    if (cart.lines.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Cart')),
        body: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.shopping_bag_outlined, size: 56, color: AppColors.textFaint),
            const SizedBox(height: Space.md),
            Text('Your cart is empty', style: AppText.h3()),
            const SizedBox(height: Space.lg),
            SizedBox(width: 200, child: PrimaryButton('Browse brands', onTap: () => context.go('/home'))),
          ]),
        ),
      );
    }
    final t = cart.totals();
    final brand = cart.brandId != null ? brandById(cart.brandId!) : null;
    final suggestions = dishesInZone()
        .where((d) => d.brandId == cart.brandId && cart.simpleQty(d.id) == 0 && offeringFor(d.id)!.available)
        .take(3)
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(brand?.name ?? 'Cart', style: AppText.h3()),
          Text('${cart.count} item${cart.count > 1 ? 's' : ''}', style: AppText.tiny()),
        ]),
      ),
      body: ListView(padding: const EdgeInsets.fromLTRB(Space.lg, Space.sm, Space.lg, 180), children: [
        if (t.savings > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: Space.md, vertical: Space.sm),
            decoration: BoxDecoration(color: AppColors.successSoft, borderRadius: BorderRadius.circular(Radii.md)),
            child: Row(children: [
              const Icon(Icons.savings_outlined, size: 16, color: AppColors.success),
              const SizedBox(width: 6),
              Text('You save ${rupees(t.savings)} on this order', style: AppText.small(c: AppColors.success, w: FontWeight.w700)),
            ]),
          ),
        const SizedBox(height: Space.md),
        // Items
        ...cart.lines.map((l) => _CartItem(l)),
        // Suggestions
        if (suggestions.isNotEmpty) ...[
          const SizedBox(height: Space.sm),
          Text('Complete your meal', style: AppText.h3()),
          const SizedBox(height: Space.sm),
          SizedBox(
            height: 92,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: suggestions.length,
              separatorBuilder: (_, __) => const SizedBox(width: Space.sm),
              itemBuilder: (c, i) {
                final d = suggestions[i];
                final off = offeringFor(d.id)!;
                return Container(
                  width: 230,
                  padding: const EdgeInsets.all(Space.sm),
                  decoration: BoxDecoration(
                    color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(children: [
                    ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.asset(d.image, width: 56, height: 56, fit: BoxFit.cover)),
                    const SizedBox(width: Space.sm),
                    Expanded(
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(d.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.small(c: AppColors.text, w: FontWeight.w600)),
                        Text(rupees(off.price), style: AppText.small(w: FontWeight.w700)),
                      ]),
                    ),
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        if (d.addons.isNotEmpty) {
                          context.push('/item/${d.id}');
                        } else {
                          context.read<CartState>().add(d, off.price, off.mrp);
                        }
                      },
                      child: Container(
                        width: 30, height: 30,
                        decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(8)),
                        child: const Icon(Icons.add, size: 18, color: Colors.white),
                      ),
                    ),
                  ]),
                );
              },
            ),
          ),
        ],
        const SizedBox(height: Space.lg),
        _couponSection(cart, t),
        const SizedBox(height: Space.lg),
        _tipSection(cart),
        const SizedBox(height: Space.lg),
        _creditsToggle(cart, t),
        const SizedBox(height: Space.lg),
        if (t.feesWaived) _zeroBanner(),
        const SizedBox(height: Space.lg),
        _bill(t),
      ]),
      bottomSheet: _checkoutBar(context, t),
    );
  }

  Widget _couponSection(CartState cart, Totals t) {
    if (cart.coupon != null) {
      return Container(
        padding: const EdgeInsets.all(Space.md),
        decoration: BoxDecoration(
          color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: AppColors.brand),
        ),
        child: Row(children: [
          const Icon(Icons.local_offer, size: 18, color: AppColors.brand),
          const SizedBox(width: Space.sm),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text("'${cart.coupon}' applied", style: AppText.body(w: FontWeight.w700)),
              Text('You saved ${rupees(t.discount)}', style: AppText.tiny(c: AppColors.success, w: FontWeight.w600)),
            ]),
          ),
          GestureDetector(
            onTap: () => context.read<CartState>().removeCoupon(),
            child: Text('Remove', style: AppText.small(c: AppColors.nonVeg, w: FontWeight.w600)),
          ),
        ]),
      );
    }
    return Column(children: [
      GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => setState(() => _couponOpen = !_couponOpen),
        child: Container(
          padding: const EdgeInsets.all(Space.md),
          decoration: BoxDecoration(
            color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(children: [
            const Icon(Icons.local_offer_outlined, size: 18, color: AppColors.text),
            const SizedBox(width: Space.sm),
            Expanded(child: Text('Apply coupon', style: AppText.body(w: FontWeight.w600))),
            Icon(_couponOpen ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: AppColors.textMuted),
          ]),
        ),
      ),
      AnimatedCrossFade(
        duration: const Duration(milliseconds: 220),
        crossFadeState: _couponOpen ? CrossFadeState.showFirst : CrossFadeState.showSecond,
        firstChild: Padding(
          padding: const EdgeInsets.only(top: Space.sm),
          child: Column(children: [
            Row(children: [
              Expanded(
                child: Container(
                  height: 46, padding: const EdgeInsets.symmetric(horizontal: Space.md),
                  decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
                  child: Center(
                    child: TextField(
                      controller: _couponCtrl,
                      textCapitalization: TextCapitalization.characters,
                      style: AppText.body(w: FontWeight.w600),
                      decoration: InputDecoration(isCollapsed: true, border: InputBorder.none, hintText: 'Enter code', hintStyle: AppText.body(c: AppColors.textFaint)),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: Space.sm),
              GestureDetector(
                onTap: () {
                  final err = context.read<CartState>().applyCoupon(_couponCtrl.text);
                  setState(() => _couponError = err);
                  if (err == null) {
                    _couponOpen = false;
                    _couponCtrl.clear();
                    HapticFeedback.mediumImpact();
                  }
                },
                child: Container(
                  height: 46, padding: const EdgeInsets.symmetric(horizontal: Space.lg),
                  decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.md)),
                  alignment: Alignment.center,
                  child: Text('Apply', style: AppText.body(c: Colors.white, w: FontWeight.w700)),
                ),
              ),
            ]),
            if (_couponError != null) Padding(padding: const EdgeInsets.only(top: 6), child: Align(alignment: Alignment.centerLeft, child: Text(_couponError!, style: AppText.tiny(c: AppColors.nonVeg)))),
            const SizedBox(height: Space.sm),
            ...coupons.values.map((c) => GestureDetector(
                  onTap: () {
                    final err = context.read<CartState>().applyCoupon(c.code);
                    setState(() => _couponError = err);
                    if (err == null) { _couponOpen = false; HapticFeedback.mediumImpact(); }
                  },
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(children: [
                      Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(6)), child: Text(c.code, style: AppText.tiny(w: FontWeight.w700))),
                      const SizedBox(width: Space.sm),
                      Expanded(child: Text(c.label, style: AppText.tiny())),
                    ]),
                  ),
                )),
          ]),
        ),
        secondChild: const SizedBox(width: double.infinity),
      ),
    ]);
  }

  Widget _tipSection(CartState cart) {
    const tips = [0, 1000, 2000, 3000];
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Tip your rider', style: AppText.h3()),
      const SizedBox(height: Space.sm),
      Row(children: tips.map((v) {
        final sel = cart.tip == v;
        return Padding(
          padding: const EdgeInsets.only(right: Space.sm),
          child: GestureDetector(
            onTap: () { HapticFeedback.selectionClick(); context.read<CartState>().setTip(v); },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: Space.md, vertical: Space.sm),
              decoration: BoxDecoration(
                color: sel ? AppColors.brand : AppColors.card,
                borderRadius: BorderRadius.circular(Radii.pill),
                border: Border.all(color: sel ? AppColors.brand : AppColors.border),
              ),
              child: Text(v == 0 ? 'None' : rupees(v), style: AppText.small(c: sel ? Colors.white : AppColors.text, w: FontWeight.w600)),
            ),
          ),
        );
      }).toList()),
    ]);
  }

  Widget _creditsToggle(CartState cart, Totals t) {
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); context.read<CartState>().toggleCredits(); },
      child: Container(
        padding: const EdgeInsets.all(Space.md),
        decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
        child: Row(children: [
          const Icon(Icons.account_balance_wallet_outlined, size: 20, color: AppColors.text),
          const SizedBox(width: Space.sm),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Use DishPop credits', style: AppText.body(w: FontWeight.w600)),
              Text('Balance ${rupees(kCreditBalance)}', style: AppText.tiny()),
            ]),
          ),
          Switch.adaptive(
            value: cart.useCredits,
            activeColor: AppColors.brand,
            onChanged: (_) => context.read<CartState>().toggleCredits(),
          ),
        ]),
      ),
    );
  }

  Widget _zeroBanner() {
    Widget col(String label) => Expanded(
          child: Column(children: [
            Text('₹0', style: poppins(size: 24, weight: FontWeight.w800, color: AppColors.text)),
            const SizedBox(height: 2),
            Text(label, textAlign: TextAlign.center, style: AppText.tiny()),
          ]),
        );
    return Container(
      padding: const EdgeInsets.symmetric(vertical: Space.lg),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: AppColors.border)),
      child: Row(children: [col('Delivery'), col('Packaging'), col('Platform')]),
    );
  }

  Widget _bill(Totals t) {
    Widget row(String k, String v, {bool strike = false, Color? c}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(k, style: AppText.small(c: AppColors.textMuted)),
            Text(v, style: AppText.small(c: c ?? AppColors.text, w: FontWeight.w600).copyWith(decoration: strike ? TextDecoration.lineThrough : null)),
          ]),
        );
    return Container(
      padding: const EdgeInsets.all(Space.lg),
      decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: AppColors.border)),
      child: Column(children: [
        Align(alignment: Alignment.centerLeft, child: Text('Bill details', style: AppText.h3())),
        const SizedBox(height: Space.sm),
        row('Item total', rupees(t.itemTotal)),
        if (t.feesWaived) ...[
          row('Delivery fee', 'FREE', c: AppColors.success),
          row('Packaging fee', 'FREE', c: AppColors.success),
        ] else ...[
          row('Delivery fee', rupees(t.delivery)),
          row('Packaging fee', rupees(t.packaging)),
        ],
        row('GST', rupees(t.tax)),
        if (t.discount > 0) row('Coupon discount', '- ${rupees(t.discount)}', c: AppColors.success),
        if (t.tip > 0) row('Rider tip', rupees(t.tip)),
        if (t.credits > 0) row('Credits', '- ${rupees(t.credits)}', c: AppColors.success),
        Divider(color: AppColors.border, height: Space.xl),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('To pay', style: AppText.h3()),
          Text(rupees(t.payable), style: AppText.h2()),
        ]),
      ]),
    );
  }

  Widget _checkoutBar(BuildContext context, Totals t) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(Space.lg),
        decoration: BoxDecoration(color: AppColors.bg, border: Border(top: BorderSide(color: AppColors.border))),
        child: Row(children: [
          Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
            Text(rupees(t.payable), style: AppText.h2()),
            Text('Total', style: AppText.tiny()),
          ]),
          const SizedBox(width: Space.lg),
          Expanded(child: PrimaryButton('Proceed to pay', icon: Icons.lock_outline, onTap: () => context.push('/checkout'))),
        ]),
      ),
    );
  }
}

class _CartItem extends StatelessWidget {
  final CartLine line;
  const _CartItem(this.line);
  @override
  Widget build(BuildContext context) {
    final discounted = line.mrp > line.unitPrice;
    final qty = line.qty;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.sm),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(padding: const EdgeInsets.only(top: 2), child: VegDot(line.veg, size: 14)),
        const SizedBox(width: Space.sm),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(line.name, style: AppText.body(w: FontWeight.w600)),
            if (line.addons.isNotEmpty)
              Text(line.addons.map((a) => a.name).join(', '), style: AppText.tiny()),
            const SizedBox(height: 2),
            Row(children: [
              Text(rupees(line.unitPrice + line.addonTotal), style: AppText.small(w: FontWeight.w700)),
              if (discounted) ...[
                const SizedBox(width: 6),
                Text(rupees(line.mrp + line.addonTotal), style: AppText.tiny(c: AppColors.textFaint).copyWith(decoration: TextDecoration.lineThrough)),
              ],
            ]),
          ]),
        ),
        const SizedBox(width: Space.sm),
        AddStepper(
          qty: qty,
          onAdd: () {},
          onInc: () => context.read<CartState>().setQty(line.id, qty + 1),
          onDec: () => context.read<CartState>().setQty(line.id, qty - 1),
        ),
      ]),
    );
  }
}
