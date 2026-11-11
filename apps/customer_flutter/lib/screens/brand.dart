import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';
import '../widgets/cart_bar.dart';

class BrandScreen extends StatelessWidget {
  final String id;
  const BrandScreen(this.id, {super.key});
  @override
  Widget build(BuildContext context) {
    final brand = brandById(id);
    if (brand == null) {
      return const Scaffold(body: Center(child: Text('Brand not found')));
    }
    final items = dishesInZone().where((d) => d.brandId == id).toList();
    final categories = <String>[];
    for (final d in items) {
      if (!categories.contains(d.category)) categories.add(d.category);
    }
    context.watch<CartState>();

    return Scaffold(
      body: Stack(children: [
        CustomScrollView(slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppColors.bg,
            foregroundColor: Colors.white,
            leading: _circleBtn(context, Icons.arrow_back),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(fit: StackFit.expand, children: [
                Image.asset(brand.banner, fit: BoxFit.cover),
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter, end: Alignment.bottomCenter,
                        colors: [Colors.black.withValues(alpha: 0.3), Colors.transparent, Colors.black.withValues(alpha: 0.75)],
                        stops: const [0, 0.4, 1],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  left: Space.lg, right: Space.lg, bottom: Space.lg,
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(children: [
                      RatingPill(brand.rating),
                      const SizedBox(width: Space.sm),
                      Icon(Icons.schedule, size: 14, color: Colors.white.withValues(alpha: 0.9)),
                      const SizedBox(width: 3),
                      Text('${kZone.etaMinutes} min', style: AppText.small(c: Colors.white)),
                    ]),
                    const SizedBox(height: 6),
                    Text(brand.name, style: AppText.display(c: Colors.white)),
                    Text(brand.cuisine, style: AppText.small(c: Colors.white70)),
                  ]),
                ),
              ]),
            ),
          ),
          // FSSAI / kitchen disclosure
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.fromLTRB(Space.lg, Space.lg, Space.lg, 0),
              padding: const EdgeInsets.all(Space.md),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(Radii.md),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(children: [
                const Icon(Icons.verified_outlined, size: 18, color: AppColors.textMuted),
                const SizedBox(width: Space.sm),
                Expanded(
                  child: Text(
                    'Prepared by ${kKitchen.legalName} · FSSAI ${kKitchen.fssai}',
                    style: AppText.tiny(w: FontWeight.w500),
                  ),
                ),
              ]),
            ),
          ),
          for (final cat in categories) ...[
            SliverToBoxAdapter(child: SectionHeader(cat)),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: Space.lg),
              sliver: SliverList(
                delegate: SliverChildListDelegate(
                  items.where((d) => d.category == cat).map((d) => _MenuRow(d)).toList(),
                ),
              ),
            ),
          ],
          const SliverToBoxAdapter(child: SizedBox(height: 120)),
        ]),
        const Positioned(left: 0, right: 0, bottom: 0, child: SafeArea(top: false, child: CartBar())),
      ]),
    );
  }

  Widget _circleBtn(BuildContext context, IconData i) => Padding(
        padding: const EdgeInsets.all(8),
        child: CircleAvatar(
          backgroundColor: Colors.black.withValues(alpha: 0.45),
          child: IconButton(
            icon: Icon(i, size: 20, color: Colors.white),
            onPressed: () => Navigator.of(context).maybePop(),
          ),
        ),
      );
}

class _MenuRow extends StatelessWidget {
  final Dish dish;
  const _MenuRow(this.dish);
  @override
  Widget build(BuildContext context) {
    final off = offeringFor(dish.id)!;
    final cart = context.watch<CartState>();
    final qty = cart.simpleQty(dish.id);
    final hasAddons = dish.addons.isNotEmpty;
    final discounted = off.mrp > off.price;

    return Padding(
      padding: const EdgeInsets.only(bottom: Space.lg),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            VegDot(dish.veg, size: 15),
            const SizedBox(height: 6),
            if (dish.tags.isNotEmpty) Padding(padding: const EdgeInsets.only(bottom: 2), child: TagLabel(dish.tags.first)),
            Text(dish.name, style: AppText.h3()),
            const SizedBox(height: 2),
            Row(children: [
              Text(rupees(off.price), style: AppText.body(w: FontWeight.w700)),
              if (discounted) ...[
                const SizedBox(width: Space.sm),
                Text(rupees(off.mrp), style: AppText.small(c: AppColors.textFaint).copyWith(decoration: TextDecoration.lineThrough)),
              ],
            ]),
            const SizedBox(height: 4),
            Text(dish.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.small()),
          ]),
        ),
        const SizedBox(width: Space.md),
        SizedBox(
          width: 110,
          child: Column(children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(Radii.md),
              child: Image.asset(dish.image, width: 110, height: 100, fit: BoxFit.cover),
            ),
            Transform.translate(
              offset: const Offset(0, -18),
              child: off.available
                  ? AddStepper(
                      qty: qty,
                      extendable: hasAddons,
                      onAdd: () {
                        if (hasAddons) {
                          context.push('/item/${dish.id}');
                        } else {
                          context.read<CartState>().add(dish, off.price, off.mrp);
                        }
                      },
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
        ),
      ]),
    );
  }
}
