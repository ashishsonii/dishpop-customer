import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class VerifyScreen extends StatefulWidget {
  final String phone;
  const VerifyScreen({required this.phone, super.key});
  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  final _ctrl = TextEditingController();
  String? _error;
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final valid = _ctrl.text.length == 6;
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(Space.xl),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Verify your number', style: AppText.h1()),
          const SizedBox(height: 4),
          Text('Enter the 6-digit code sent to +91 ${widget.phone}', style: AppText.body(c: AppColors.textMuted)),
          const SizedBox(height: Space.sm),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: AppColors.brandSoft, borderRadius: BorderRadius.circular(6)),
            child: Text('Dev code: $kDevOtp', style: AppText.tiny(w: FontWeight.w600)),
          ),
          const SizedBox(height: Space.xl),
          Container(
            height: 56, padding: const EdgeInsets.symmetric(horizontal: Space.lg),
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: _error != null ? AppColors.nonVeg : AppColors.border)),
            child: TextField(
              controller: _ctrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              autofocus: true,
              onChanged: (_) => setState(() => _error = null),
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              textAlign: TextAlign.center,
              style: AppText.h2().copyWith(letterSpacing: 10),
              decoration: const InputDecoration(counterText: '', border: InputBorder.none, isCollapsed: true, hintText: '••••••'),
            ),
          ),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(_error!, style: AppText.tiny(c: AppColors.nonVeg))),
          const Spacer(),
          PrimaryButton('Verify & continue', onTap: valid ? () {
            final err = context.read<AuthState>().verify(widget.phone, _ctrl.text);
            if (err != null) {
              setState(() => _error = err);
              HapticFeedback.heavyImpact();
            } else {
              HapticFeedback.mediumImpact();
              // pop verify + phone back to where auth was triggered
              context.go('/account');
            }
          } : null),
        ]),
      ),
    );
  }
}
