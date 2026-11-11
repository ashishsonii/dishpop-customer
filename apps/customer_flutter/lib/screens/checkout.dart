import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});
  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String _pay = 'upi';
  bool _placing = false;

  static const _methods = [
    ('upi', Icons.qr_code, 'UPI', 'GPay, PhonePe, Paytm'),
    ('card', Icons.credit_card, 'Card', 'Credit / Debit'),
    ('cod', Icons.payments_outlined, 'Cash', 'Pay on delivery'),
  ];

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartState>();
    final zone = context.watch<ZoneState>();
    final auth = context.watch<AuthState>();
    final t = cart.totals();
    final brand = cart.brandId != null ? brandById(cart.brandId!) : null;
    final address = zone.address ?? kZone.name;

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: ListView(padding: const EdgeInsets.fromLTRB(Space.lg, Space.sm, Space.lg, 140), children: [
        _section('Delivering to'),
        _card(Row(children: [
          const Icon(Icons.location_on_outlined, color: AppColors.text),
          const SizedBox(width: Space.md),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Home', style: AppText.body(w: FontWeight.w700)),
            Text(address, style: AppText.small()),
          ])),
          Text('${kZone.etaMinutes} min', style: AppText.small(w: FontWeight.w600)),
        ])),
        const SizedBox(height: Space.lg),
        _section('Payment method'),
        ..._methods.map((m) {
          final sel = _pay == m.$1;
          return GestureDetector(
            onTap: () => setState(() => _pay = m.$1),
            child: Container(
              margin: const EdgeInsets.only(bottom: Space.sm),
              padding: const EdgeInsets.all(Space.md),
              decoration: BoxDecoration(
                color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md),
                border: Border.all(color: sel ? AppColors.brand : AppColors.border, width: sel ? 1.5 : 1),
              ),
              child: Row(children: [
                Icon(m.$2, size: 22, color: AppColors.text),
                const SizedBox(width: Space.md),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(m.$3, style: AppText.body(w: FontWeight.w600)),
                  Text(m.$4, style: AppText.tiny()),
                ])),
                Icon(sel ? Icons.radio_button_checked : Icons.radio_button_off, color: sel ? AppColors.brand : AppColors.textFaint),
              ]),
            ),
          );
        }),
        const SizedBox(height: Space.lg),
        _card(Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Total payable', style: AppText.h3()),
          Text(rupees(t.payable), style: AppText.h2()),
        ])),
      ]),
      bottomSheet: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Space.lg),
          child: PrimaryButton(
            _placing ? 'Placing…' : 'Place order  ·  ${rupees(t.payable)}',
            loading: _placing,
            onTap: () async {
              if (!auth.signedIn) { context.push('/auth/phone'); return; }
              setState(() => _placing = true);
              await Future.delayed(const Duration(milliseconds: 700));
              final method = _methods.firstWhere((m) => m.$1 == _pay).$3;
              final items = cart.lines.map((l) => (l.name, l.qty)).toList();
              final id = context.read<OrdersState>().place(
                  brand?.name ?? 'DishPop', items, t.payable, address, method, kZone.etaMinutes);
              context.read<CartState>().clear();
              if (mounted) context.go('/order/$id');
            },
          ),
        ),
      ),
    );
  }

  Widget _section(String s) => Padding(
        padding: const EdgeInsets.only(bottom: Space.sm, top: Space.sm),
        child: Text(s, style: AppText.h3()),
      );
  Widget _card(Widget child) => Container(
        padding: const EdgeInsets.all(Space.md),
        decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
        child: child,
      );
}
