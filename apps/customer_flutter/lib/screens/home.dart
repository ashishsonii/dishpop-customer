import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/cards.dart';
import '../widgets/cart_bar.dart';
import '../widgets/common.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override
  Widget build(BuildContext context) {
    final zone = context.watch<ZoneState>();
    final brandList = brandsInZone();
    final dishList = dishesInZone();
    final address = zone.address ?? kZone.name;

    return SafeArea(
      bottom: false,
      child: Stack(children: [
        CustomScrollView(slivers: [
          SliverToBoxAdapter(child: _TopBar(address: address, loading: zone.status == 'loading')),
          const SliverToBoxAdapter(child: HeroCarousel()),
          SliverToBoxAdapter(child: const SectionHeader('Brands near you')),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: Space.lg),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (c, i) => BrandCard(brandList[i], kZone.etaMinutes),
                childCount: brandList.length,
              ),
            ),
          ),
          SliverToBoxAdapter(child: const SectionHeader('Popular right now')),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(Space.lg, 0, Space.lg, 120),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, mainAxisSpacing: 0, crossAxisSpacing: Space.md, childAspectRatio: 0.64),
              delegate: SliverChildBuilderDelegate(
                (c, i) => DishCard(dishList[i], double.infinity),
                childCount: dishList.length,
              ),
            ),
          ),
        ]),
        const Positioned(left: 0, right: 0, bottom: 0, child: CartBar()),
      ]),
    );
  }
}

class _TopBar extends StatelessWidget {
  final String address;
  final bool loading;
  const _TopBar({required this.address, required this.loading});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Space.lg, Space.md, Space.lg, Space.sm),
      child: Row(children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              const Icon(Icons.location_on, size: 16, color: AppColors.brand),
              const SizedBox(width: 4),
              Text('Delivering to', style: AppText.tiny(w: FontWeight.w600)),
            ]),
            const SizedBox(height: 2),
            Row(children: [
              Flexible(
                child: Text(loading ? 'Finding you…' : address,
                    maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.h3()),
              ),
              const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.text),
            ]),
          ]),
        ),
        const SizedBox(width: Space.md),
        GestureDetector(
          onTap: () => context.push('/account'),
          child: Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: AppColors.brandSoft, shape: BoxShape.circle,
              border: Border.all(color: AppColors.border),
            ),
            child: const Icon(Icons.person_outline, size: 20, color: AppColors.text),
          ),
        ),
      ]),
    );
  }
}

class HeroCarousel extends StatefulWidget {
  const HeroCarousel({super.key});
  @override
  State<HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends State<HeroCarousel> {
  final _controller = PageController();
  int _page = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 3500), (_) {
      if (!_controller.hasClients) return;
      final next = (_page + 1) % 2;
      _controller.animateToPage(next,
          duration: const Duration(milliseconds: 520), curve: Curves.easeInOut);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      SizedBox(
        height: 150,
        child: PageView(
          controller: _controller,
          onPageChanged: (i) => setState(() => _page = i),
          children: const [_DiscountSlide(), _ZeroFeesSlide()],
        ),
      ),
      const SizedBox(height: Space.md),
      Row(mainAxisAlignment: MainAxisAlignment.center, children: List.generate(2, (i) {
        final active = i == _page;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          margin: const EdgeInsets.symmetric(horizontal: 3),
          width: active ? 18 : 6, height: 6,
          decoration: BoxDecoration(
            color: active ? AppColors.brand : AppColors.border,
            borderRadius: BorderRadius.circular(3),
          ),
        );
      })),
    ]);
  }
}

class _DiscountSlide extends StatelessWidget {
  const _DiscountSlide();
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: Space.lg),
      padding: const EdgeInsets.all(Space.xl),
      decoration: BoxDecoration(
        color: AppColors.brand,
        borderRadius: BorderRadius.circular(Radii.lg),
      ),
      child: Row(children: [
        Expanded(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('WELCOME OFFER', style: AppText.tiny(c: Colors.white54, w: FontWeight.w700).copyWith(letterSpacing: 1)),
            const SizedBox(height: 6),
            RichText(
              text: TextSpan(children: [
                TextSpan(text: '50% OFF', style: poppins(size: 30, weight: FontWeight.w800, color: Colors.white)),
              ]),
            ),
            const SizedBox(height: 2),
            Text('on your first 3 orders', style: AppText.body(c: Colors.white70)),
            const SizedBox(height: Space.md),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white24),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text('CODE: FIRST50', style: AppText.small(c: Colors.white, w: FontWeight.w700)),
            ),
          ]),
        ),
        Icon(Icons.local_offer, size: 64, color: Colors.white.withValues(alpha: 0.12)),
      ]),
    );
  }
}

class _ZeroFeesSlide extends StatelessWidget {
  const _ZeroFeesSlide();
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: Space.lg),
      padding: const EdgeInsets.symmetric(horizontal: Space.xl, vertical: Space.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(children: [
        Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.only(top: 14),
            child: Text('₹', style: poppins(size: 32, weight: FontWeight.w700, color: AppColors.text)),
          ),
          Text('0', style: poppins(size: 86, weight: FontWeight.w800, color: AppColors.text, height: 1)),
        ]),
        const SizedBox(width: Space.lg),
        Expanded(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Zero fees', style: AppText.h2()),
            const SizedBox(height: 2),
            Text('No delivery, packaging or platform charges this launch.',
                style: AppText.small()),
          ]),
        ),
      ]),
    );
  }
}
