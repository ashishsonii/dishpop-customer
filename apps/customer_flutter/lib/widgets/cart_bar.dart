import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';

/// Floating "view cart" bar — place at the bottom of a screen's Stack.
class CartBar extends StatelessWidget {
  const CartBar({super.key});
  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartState>();
    if (cart.lines.isEmpty) return const SizedBox.shrink();
    final t = cart.totals();
    final brand = cart.brandId != null ? brandById(cart.brandId!) : null;
    return Padding(
      padding: const EdgeInsets.fromLTRB(Space.md, 0, Space.md, Space.md),
      child: GestureDetector(
        onTap: () => context.push('/cart'),
        child: Container(
          height: 58,
          padding: const EdgeInsets.symmetric(horizontal: Space.lg),
          decoration: BoxDecoration(
            color: AppColors.brand,
            borderRadius: BorderRadius.circular(Radii.md),
            boxShadow: [
              BoxShadow(color: AppColors.brand.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
            ],
          ),
          child: Row(children: [
            Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
              child: Text('${cart.count}', style: AppText.h3(c: Colors.white)),
            ),
            const SizedBox(width: Space.md),
            Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(brand?.name ?? 'Your cart', style: AppText.small(c: Colors.white70)),
              Text(rupees(t.payable), style: AppText.h3(c: Colors.white)),
            ]),
            const Spacer(),
            Text('View cart', style: AppText.h3(c: Colors.white)),
            const Icon(Icons.arrow_forward, size: 18, color: Colors.white),
          ]),
        ),
      ),
    );
  }
}
