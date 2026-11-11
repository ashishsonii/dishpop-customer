import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();
    final user = auth.user;
    return SafeArea(
      bottom: false,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(Space.lg, Space.lg, Space.lg, Space.xl),
        children: [
          // Profile header
          GestureDetector(
            onTap: () => context.push(user == null ? '/auth/phone' : '/account/profile'),
            child: Row(children: [
              Container(
                width: 56, height: 56,
                decoration: const BoxDecoration(color: AppColors.brand, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Text(
                  user?.name?.isNotEmpty == true ? user!.name![0].toUpperCase() : 'G',
                  style: poppins(size: 22, weight: FontWeight.w700, color: Colors.white),
                ),
              ),
              const SizedBox(width: Space.md),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(user?.name ?? (user != null ? 'Add your name' : 'Guest'), style: AppText.h2()),
                  Text(user != null ? '+91 ${user.phone}' : 'Tap to sign in', style: AppText.small()),
                ]),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textFaint),
            ]),
          ),
          const SizedBox(height: Space.xl),
          // Referral banner
          GestureDetector(
            onTap: () => context.push('/account/refer'),
            child: Container(
              padding: const EdgeInsets.all(Space.lg),
              decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.lg)),
              child: Row(children: [
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Refer & earn ₹100', style: AppText.h3(c: Colors.white)),
                    const SizedBox(height: 2),
                    Text('Invite friends, you both save.', style: AppText.small(c: Colors.white60)),
                  ]),
                ),
                const Icon(Icons.card_giftcard, color: Colors.white),
              ]),
            ),
          ),
          const SizedBox(height: Space.md),
          // Two tiles
          Row(children: [
            Expanded(child: _Tile(icon: Icons.account_balance_wallet_outlined, label: 'Credits', value: rupees(kCreditBalance), onTap: () => context.push('/account/credits'))),
            const SizedBox(width: Space.md),
            Expanded(child: _Tile(icon: Icons.local_offer_outlined, label: 'Offers', value: '3 live', onTap: () => context.push('/account/offers'))),
          ]),
          const SizedBox(height: Space.xl),
          // Rows
          _Row(icon: Icons.receipt_long_outlined, label: 'Your orders', onTap: () => context.go('/orders')),
          _Row(icon: Icons.payment_outlined, label: 'Payments', onTap: () => context.push('/account/payments')),
          _Row(icon: Icons.settings_outlined, label: 'Settings', onTap: () => context.push('/account/settings')),
          _Row(icon: Icons.help_outline, label: 'Help & support', onTap: () => context.push('/account/help')),
          const SizedBox(height: Space.xl),
          if (user != null)
            GestureDetector(
              onTap: () => context.read<AuthState>().signOut(),
              child: Center(child: Text('Sign out', style: AppText.body(c: AppColors.nonVeg, w: FontWeight.w600))),
            ),
          const SizedBox(height: Space.lg),
          Center(child: Text('DishPop • v1.0', style: AppText.tiny(c: AppColors.textFaint))),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final VoidCallback onTap;
  const _Tile({required this.icon, required this.label, required this.value, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(Space.lg),
        decoration: BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, size: 22, color: AppColors.text),
          const SizedBox(height: Space.md),
          Text(value, style: AppText.h3()),
          Text(label, style: AppText.small()),
        ]),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _Row({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: Space.md),
        child: Row(children: [
          Icon(icon, size: 22, color: AppColors.textMuted),
          const SizedBox(width: Space.md),
          Expanded(child: Text(label, style: AppText.body(w: FontWeight.w600))),
          const Icon(Icons.chevron_right, size: 20, color: AppColors.textFaint),
        ]),
      ),
    );
  }
}
