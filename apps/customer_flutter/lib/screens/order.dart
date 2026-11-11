import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class OrderScreen extends StatelessWidget {
  final String id;
  const OrderScreen(this.id, {super.key});
  @override
  Widget build(BuildContext context) {
    final orders = context.watch<OrdersState>();
    final o = orders.byId(id);
    if (o == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Order not found', style: AppText.body())),
      );
    }
    final done = o.stage >= orderStages.length - 1;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => context.go('/home')),
        title: Text('Order $id', style: AppText.h3()),
      ),
      body: ListView(padding: const EdgeInsets.all(Space.lg), children: [
        // Status hero
        Container(
          padding: const EdgeInsets.all(Space.xl),
          decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.lg)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(done ? 'Delivered' : 'Arriving in ~${o.etaMinutes} min',
                style: AppText.h1(c: Colors.white)),
            const SizedBox(height: 4),
            Text(orderStages[o.stage].$2, style: AppText.body(c: Colors.white70)),
          ]),
        ),
        const SizedBox(height: Space.xl),
        // Timeline
        ...List.generate(orderStages.length, (i) {
          final reached = i <= o.stage;
          final current = i == o.stage;
          final s = orderStages[i];
          return IntrinsicHeight(
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Column(children: [
                Container(
                  width: 22, height: 22,
                  decoration: BoxDecoration(
                    color: reached ? AppColors.brand : AppColors.card,
                    shape: BoxShape.circle,
                    border: Border.all(color: reached ? AppColors.brand : AppColors.border, width: 2),
                  ),
                  child: reached ? const Icon(Icons.check, size: 13, color: Colors.white) : null,
                ),
                if (i < orderStages.length - 1)
                  Expanded(child: Container(width: 2, color: i < o.stage ? AppColors.brand : AppColors.border)),
              ]),
              const SizedBox(width: Space.md),
              Padding(
                padding: const EdgeInsets.only(bottom: Space.lg),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(s.$1, style: AppText.body(c: reached ? AppColors.text : AppColors.textFaint, w: current ? FontWeight.w700 : FontWeight.w600)),
                  Text(s.$2, style: AppText.tiny()),
                ]),
              ),
            ]),
          );
        }),
        const SizedBox(height: Space.sm),
        // Rider
        if (!done)
          Container(
            padding: const EdgeInsets.all(Space.md),
            decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
            child: Row(children: [
              Container(
                width: 42, height: 42,
                decoration: const BoxDecoration(color: AppColors.brandSoft, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Text(o.riderName[0], style: AppText.h3()),
              ),
              const SizedBox(width: Space.md),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(o.riderName, style: AppText.body(w: FontWeight.w700)),
                Text('Your delivery partner', style: AppText.tiny()),
              ])),
              const Icon(Icons.call_outlined, color: AppColors.text),
            ]),
          ),
        const SizedBox(height: Space.lg),
        // Summary
        Container(
          padding: const EdgeInsets.all(Space.lg),
          decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: AppColors.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(o.brandName, style: AppText.h3()),
            const SizedBox(height: Space.sm),
            ...o.items.map((e) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(children: [
                    Text('${e.$2}×', style: AppText.small(w: FontWeight.w700)),
                    const SizedBox(width: 6),
                    Expanded(child: Text(e.$1, style: AppText.small())),
                  ]),
                )),
            Divider(color: AppColors.border, height: Space.xl),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('Paid · ${o.paymentMethod}', style: AppText.small()),
              Text(rupees(o.payable), style: AppText.h3()),
            ]),
          ]),
        ),
        const SizedBox(height: Space.lg),
        PrimaryButton('Back to home', onTap: () => context.go('/home')),
      ]),
    );
  }
}
