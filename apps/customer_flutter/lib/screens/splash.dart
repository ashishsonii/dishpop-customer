import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _c =
      AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..forward();
  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));
    Future.delayed(const Duration(milliseconds: 1900), () {
      if (mounted) context.go('/home');
    });
  }

  @override
  void dispose() {
    _c.dispose();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarIconBrightness: Brightness.dark,
    ));
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fade = CurvedAnimation(parent: _c, curve: Curves.easeOut);
    return Scaffold(
      backgroundColor: AppColors.brand,
      body: Stack(children: [
        Positioned.fill(
          child: Opacity(
            opacity: 0.06,
            child: Image.asset('assets/img/shutter.png', fit: BoxFit.cover, repeat: ImageRepeat.repeat),
          ),
        ),
        Center(
          child: FadeTransition(
            opacity: fade,
            child: ScaleTransition(
              scale: Tween(begin: 0.9, end: 1.0).animate(CurvedAnimation(parent: _c, curve: Curves.easeOutBack)),
              child: const Wordmark(size: 54, color: Colors.white),
            ),
          ),
        ),
        Positioned(
          left: 0, right: 0, bottom: 54,
          child: FadeTransition(
            opacity: fade,
            child: Text('Fresh brands. One kitchen.',
                textAlign: TextAlign.center,
                style: AppText.small(c: Colors.white54, w: FontWeight.w500)),
          ),
        ),
      ]),
    );
  }
}
