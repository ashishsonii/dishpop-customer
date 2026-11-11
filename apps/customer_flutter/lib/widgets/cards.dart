import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import 'common.dart';

class BrandCard extends StatelessWidget {
  final Brand brand;
  final int eta;
  const BrandCard(this.brand, this.eta, {super.key});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/brand/${brand.id}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: Space.lg),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: AppColors.border, width: 0.5),
          boxShadow: cardShadow(),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Stack(children: [
            Image.asset(brand.banner, height: 170, width: double.infinity, fit: BoxFit.cover),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.black.withValues(alpha: 0.15), Colors.transparent, Colors.black.withValues(alpha: 0.85)],
                    stops: const [0, 0.35, 1],
                  ),
                ),
              ),
            ),
            Positioned(top: Space.md, right: Space.md, child: RatingPill(brand.rating)),
            Positioned(
              left: Space.lg, right: Space.lg, bottom: Space.md,
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(brand.name, style: AppText.h1(c: Colors.white)),
                Text(brand.cuisine, style: AppText.small(c: Colors.white70)),
              ]),
            ),
          ]),
          Padding(
            padding: const EdgeInsets.all(Space.md),
            child: Row(children: [
              const Icon(Icons.schedule, size: 15, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text('$eta min', style: AppText.small(c: AppColors.text)),
              const SizedBox(width: Space.sm),
              Container(width: 3, height: 3, decoration: const BoxDecoration(color: AppColors.textFaint, shape: BoxShape.circle)),
              const SizedBox(width: Space.sm),
              Expanded(child: Text(brand.tagline, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.small())),
              const Icon(Icons.chevron_right, size: 16, color: AppColors.textFaint),
            ]),
          ),
        ]),
      ),
    );
  }
}

class DishCard extends StatelessWidget {
  final Dish dish;
  final double width;
  const DishCard(this.dish, this.width, {super.key});
  @override
  Widget build(BuildContext context) {
    final off = offeringFor(dish.id)!;
    final cart = context.watch<CartState>();
    final hasAddons = dish.addons.isNotEmpty;
    final qty = cart.simpleQty(dish.id);
    final brand = brandById(dish.brandId)!;
    final discounted = off.mrp > off.price;

    void onAdd() {
      if (hasAddons) {
        context.push('/item/${dish.id}');
      } else {
        context.read<CartState>().add(dish, off.price, off.mrp);
      }
    }

    return Container(
      width: width,
      margin: const EdgeInsets.only(bottom: Space.lg),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.border, width: 0.5),
        boxShadow: cardShadow(),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Stack(clipBehavior: Clip.none, children: [
          Image.asset(dish.image, height: 130, width: double.infinity, fit: BoxFit.cover),
          Positioned(
            top: Space.sm, left: Space.sm,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.92), borderRadius: BorderRadius.circular(4)),
              child: VegDot(dish.veg, size: 15),
            ),
          ),
          Positioned(
            bottom: -18, right: Space.sm,
            child: off.available
                ? AddStepper(
                    qty: qty,
                    extendable: hasAddons,
                    onAdd: onAdd,
                    onInc: () => context.read<CartState>().setQty('${dish.id}::', qty + 1),
                    onDec: () => context.read<CartState>().setQty('${dish.id}::', qty - 1),
                  )
                : Container(
                    width: 92, height: 36,
                    decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(Radii.md)),
                    alignment: Alignment.center,
                    child: Text('Sold out', style: AppText.small(w: FontWeight.w600)),
                  ),
          ),
        ]),
        Padding(
          padding: const EdgeInsets.fromLTRB(Space.md, Space.lg + 2, Space.md, Space.md),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            if (dish.tags.isNotEmpty) Padding(padding: const EdgeInsets.only(bottom: 2), child: TagLabel(dish.tags.first)),
            Text(dish.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3().copyWith(fontWeight: FontWeight.w600)),
            Text(brand.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.tiny()),
            const SizedBox(height: Space.xs),
            Row(children: [
              Text(rupees(off.price), style: AppText.body(w: FontWeight.w700)),
              if (discounted) ...[
                const SizedBox(width: Space.sm),
                Text(rupees(off.mrp), style: AppText.small(c: AppColors.textFaint).copyWith(decoration: TextDecoration.lineThrough)),
              ],
            ]),
          ]),
        ),
      ]),
    );
  }
}
