import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final orders = context.watch<OrdersState>().orders;
    return SafeArea(
      bottom: false,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(Space.lg, Space.lg, Space.lg, Space.sm),
          child: Text('Your orders', style: AppText.h1()),
        ),
        Expanded(
          child: orders.isEmpty
              ? _Empty()
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(Space.lg, Space.sm, Space.lg, Space.xl),
                  itemCount: orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: Space.md),
                  itemBuilder: (c, i) {
                    final o = orders[i];
                    final stage = orderStages[o.stage];
                    final live = o.stage < orderStages.length - 1;
                    return GestureDetector(
                      onTap: () => context.push('/order/${o.id}'),
                      child: Container(
                        padding: const EdgeInsets.all(Space.lg),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(Radii.lg),
                          border: Border.all(color: AppColors.border),
                          boxShadow: cardShadow(),
                        ),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Expanded(child: Text(o.brandName, style: AppText.h3())),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: live ? AppColors.brand : AppColors.successSoft,
                                borderRadius: BorderRadius.circular(Radii.pill),
                              ),
                              child: Text(live ? 'LIVE' : 'DELIVERED',
                                  style: AppText.tiny(c: live ? Colors.white : AppColors.success, w: FontWeight.w700)),
                            ),
                          ]),
                          const SizedBox(height: 4),
                          Text(o.items.map((e) => '${e.$2}× ${e.$1}').join(', '),
                              maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.small()),
                          const SizedBox(height: Space.sm),
                          Divider(color: AppColors.border, height: Space.lg),
                          Row(children: [
                            Icon(live ? Icons.schedule : Icons.check_circle, size: 15, color: live ? AppColors.brand : AppColors.success),
                            const SizedBox(width: 5),
                            Expanded(child: Text(stage.$1, style: AppText.small(c: AppColors.text, w: FontWeight.w600))),
                            Text(rupees(o.payable), style: AppText.body(w: FontWeight.w700)),
                          ]),
                        ]),
                      ),
                    );
                  },
                ),
        ),
      ]),
    );
  }
}

class _Empty extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.receipt_long_outlined, size: 56, color: AppColors.textFaint),
        const SizedBox(height: Space.md),
        Text('No orders yet', style: AppText.h3()),
        const SizedBox(height: 4),
        Text('Your orders will show up here.', style: AppText.small()),
      ]),
    );
  }
}
