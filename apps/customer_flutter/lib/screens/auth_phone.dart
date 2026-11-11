import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});
  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _ctrl = TextEditingController();
  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    final valid = _ctrl.text.length == 10;
    return Scaffold(
      appBar: AppBar(),
      body: Padding(
        padding: const EdgeInsets.all(Space.xl),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Wordmark(size: 40),
          const SizedBox(height: Space.xl),
          Text('Enter your phone', style: AppText.h1()),
          const SizedBox(height: 4),
          Text('We will send a one-time code to verify.', style: AppText.body(c: AppColors.textMuted)),
          const SizedBox(height: Space.xl),
          Container(
            height: 56, padding: const EdgeInsets.symmetric(horizontal: Space.lg),
            decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(Radii.md), border: Border.all(color: AppColors.border)),
            child: Row(children: [
              Text('+91', style: AppText.h3()),
              Container(width: 1, height: 24, margin: const EdgeInsets.symmetric(horizontal: Space.md), color: AppColors.border),
              Expanded(
                child: TextField(
                  controller: _ctrl,
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  autofocus: true,
                  onChanged: (_) => setState(() {}),
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: AppText.h3().copyWith(letterSpacing: 1.5),
                  decoration: const InputDecoration(counterText: '', border: InputBorder.none, isCollapsed: true, hintText: '00000 00000'),
                ),
              ),
            ]),
          ),
          const Spacer(),
          PrimaryButton('Continue', onTap: valid ? () => context.push('/auth/verify?phone=${_ctrl.text}') : null),
          const SizedBox(height: Space.md),
          Center(child: Text('By continuing you agree to our Terms & Privacy Policy',
              textAlign: TextAlign.center, style: AppText.tiny())),
        ]),
      ),
    );
  }
}
