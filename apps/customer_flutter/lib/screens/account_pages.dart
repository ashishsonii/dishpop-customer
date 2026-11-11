import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

Widget _page(String title, Widget body) => Scaffold(
      appBar: AppBar(title: Text(title, style: AppText.h2())),
      body: body,
    );

Widget _listRow(IconData icon, String label, {String? value, VoidCallback? onTap, Color? color}) =>
    Builder(builder: (context) => InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Space.lg, vertical: Space.md),
        child: Row(children: [
          Icon(icon, size: 21, color: color ?? AppColors.textMuted),
          const SizedBox(width: Space.md),
          Expanded(child: Text(label, style: AppText.body(c: color ?? AppColors.text, w: FontWeight.w600))),
          if (value != null) Text(value, style: AppText.small()),
          if (onTap != null) const Icon(Icons.chevron_right, size: 20, color: AppColors.textFaint),
        ]),
      ),
    ));

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});
  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late final TextEditingController _name =
      TextEditingController(text: context.read<AuthState>().user?.name ?? '');
  @override
  void dispose() { _name.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthState>().user;
    return _page('Profile', ListView(padding: const EdgeInsets.all(Space.lg), children: [
      Center(
        child: Container(
          width: 72, height: 72,
          decoration: const BoxDecoration(color: AppColors.brand, shape: BoxShape.circle),
          alignment: Alignment.center,
          child: Text(_name.text.isNotEmpty ? _name.text[0].toUpperCase() : 'G', style: poppins(size: 28, weight: FontWeight.w700, color: Colors.white)),
        ),
      ),
      const SizedBox(height: Space.xl),
      Text('Name', style: AppText.small(w: FontWeight.w600)),
      const SizedBox(height: 6),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: Space.md),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
        child: TextField(
          controller: _name,
          onChanged: (_) => setState(() {}),
          style: AppText.body(),
          decoration: const InputDecoration(border: InputBorder.none, hintText: 'Your name'),
        ),
      ),
      const SizedBox(height: Space.lg),
      Text('Phone', style: AppText.small(w: FontWeight.w600)),
      const SizedBox(height: 6),
      Container(
        padding: const EdgeInsets.all(Space.md),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
        child: Text('+91 ${user?.phone ?? ''}', style: AppText.body(c: AppColors.textMuted)),
      ),
      const SizedBox(height: Space.xl),
      PrimaryButton('Save', onTap: _name.text.trim().isEmpty ? null : () {
        context.read<AuthState>().setName(_name.text.trim());
        HapticFeedback.mediumImpact();
        Navigator.of(context).maybePop();
      }),
    ]));
  }
}

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});
  @override
  Widget build(BuildContext context) => _page('Settings', ListView(children: [
        _listRow(Icons.notifications_outlined, 'Notifications', value: 'On'),
        _listRow(Icons.location_on_outlined, 'Saved addresses', onTap: () {}),
        _listRow(Icons.language, 'Language', value: 'English'),
        _listRow(Icons.lock_outline, 'Privacy', onTap: () {}),
        const Divider(height: 1),
        _listRow(Icons.description_outlined, 'Terms of service', onTap: () {}),
        _listRow(Icons.shield_outlined, 'Privacy policy', onTap: () {}),
      ]));
}

class PaymentsPage extends StatelessWidget {
  const PaymentsPage({super.key});
  @override
  Widget build(BuildContext context) => _page('Payments', ListView(children: [
        const SizedBox(height: Space.sm),
        _listRow(Icons.qr_code, 'UPI', value: 'Add'),
        _listRow(Icons.credit_card, 'Credit / Debit card', value: 'Add'),
        _listRow(Icons.account_balance_wallet_outlined, 'DishPop credits', value: rupees(kCreditBalance)),
        const Padding(
          padding: EdgeInsets.all(Space.lg),
          child: Text('Payments are mocked in this build. Razorpay/Cashfree integration comes with the backend.',
              style: TextStyle(color: AppColors.textFaint, fontSize: 12)),
        ),
      ]));
}

class HelpPage extends StatelessWidget {
  const HelpPage({super.key});
  @override
  Widget build(BuildContext context) => _page('Help & support', ListView(children: [
        _listRow(Icons.chat_bubble_outline, 'Chat with us', onTap: () {}),
        _listRow(Icons.receipt_long_outlined, 'Order issues', onTap: () {}),
        _listRow(Icons.help_outline, 'FAQs', onTap: () {}),
        _listRow(Icons.call_outlined, 'Call support', value: '1800-000-000'),
      ]));
}

class ReferPage extends StatelessWidget {
  const ReferPage({super.key});
  @override
  Widget build(BuildContext context) => _page('Refer & earn', ListView(padding: const EdgeInsets.all(Space.lg), children: [
        Container(
          padding: const EdgeInsets.all(Space.xl),
          decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.lg)),
          child: Column(children: [
            const Icon(Icons.card_giftcard, color: Colors.white, size: 40),
            const SizedBox(height: Space.md),
            Text('Give ₹100, Get ₹100', style: AppText.h2(c: Colors.white)),
            const SizedBox(height: 4),
            Text('Share your code. When a friend orders, you both get ₹100 in credits.',
                textAlign: TextAlign.center, style: AppText.small(c: Colors.white70)),
          ]),
        ),
        const SizedBox(height: Space.lg),
        Container(
          padding: const EdgeInsets.all(Space.md),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border, width: 1)),
          child: Row(children: [
            Expanded(child: Text('DISH-HITESH', style: AppText.h3().copyWith(letterSpacing: 2))),
            GestureDetector(
              onTap: () {
                Clipboard.setData(const ClipboardData(text: 'DISH-HITESH'));
                HapticFeedback.mediumImpact();
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Code copied'), duration: Duration(seconds: 1)));
              },
              child: Text('Copy', style: AppText.body(c: AppColors.brand, w: FontWeight.w700)),
            ),
          ]),
        ),
        const SizedBox(height: Space.lg),
        PrimaryButton('Share invite', icon: Icons.share_outlined, onTap: () {}),
      ]));
}

class CreditsPage extends StatelessWidget {
  const CreditsPage({super.key});
  @override
  Widget build(BuildContext context) => _page('DishPop credits', ListView(padding: const EdgeInsets.all(Space.lg), children: [
        Container(
          padding: const EdgeInsets.all(Space.xl),
          decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.lg)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Available balance', style: AppText.small(c: Colors.white60)),
            const SizedBox(height: 4),
            Text(rupees(kCreditBalance), style: poppins(size: 40, weight: FontWeight.w800, color: Colors.white)),
          ]),
        ),
        const SizedBox(height: Space.lg),
        Text('Recent', style: AppText.h3()),
        const SizedBox(height: Space.sm),
        _creditRow('Welcome bonus', '+ ₹100'),
        _creditRow('Referral reward', '+ ₹50'),
      ]));
  Widget _creditRow(String label, String amt) => Padding(
        padding: const EdgeInsets.symmetric(vertical: Space.sm),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label, style: AppText.body()),
          Text(amt, style: AppText.body(c: AppColors.success, w: FontWeight.w700)),
        ]),
      );
}

class OffersPage extends StatelessWidget {
  const OffersPage({super.key});
  @override
  Widget build(BuildContext context) => _page('Offers', ListView(padding: const EdgeInsets.all(Space.lg), children: [
        ...coupons.values.map((c) => Container(
              margin: const EdgeInsets.only(bottom: Space.md),
              padding: const EdgeInsets.all(Space.lg),
              decoration: BoxDecoration(color: AppColors.card, borderRadius: BorderRadius.circular(Radii.lg), border: Border.all(color: AppColors.border)),
              child: Row(children: [
                const Icon(Icons.local_offer_outlined, color: AppColors.brand),
                const SizedBox(width: Space.md),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(c.code, style: AppText.h3().copyWith(letterSpacing: 1)),
                  Text(c.label, style: AppText.small()),
                ])),
              ]),
            )),
      ]));
}
