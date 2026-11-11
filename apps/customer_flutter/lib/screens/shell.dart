import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';

class AppShell extends StatelessWidget {
  final StatefulNavigationShell shell;
  const AppShell({required this.shell, super.key});

  @override
  Widget build(BuildContext context) {
    final cartCount = context.watch<CartState>().count;
    return Scaffold(
      body: shell,
      bottomNavigationBar: _BottomBar(
        index: shell.currentIndex,
        cartCount: cartCount,
        onTap: (i) {
          HapticFeedback.selectionClick();
          shell.goBranch(i, initialLocation: i == shell.currentIndex);
        },
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  final int index, cartCount;
  final ValueChanged<int> onTap;
  const _BottomBar({required this.index, required this.cartCount, required this.onTap});

  static const _items = [
    (Icons.home_outlined, Icons.home, 'Home'),
    (Icons.search_outlined, Icons.search, 'Search'),
    (Icons.receipt_long_outlined, Icons.receipt_long, 'Orders'),
    (Icons.person_outline, Icons.person, 'Account'),
  ];

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).padding.bottom;
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bg,
        border: Border(top: BorderSide(color: AppColors.border, width: 0.5)),
      ),
      padding: EdgeInsets.only(bottom: bottomInset > 0 ? bottomInset : Space.sm, top: Space.sm),
      child: Row(
        children: List.generate(_items.length, (i) {
          final active = i == index;
          final (outline, filled, label) = _items[i];
          return Expanded(
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => onTap(i),
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(active ? filled : outline,
                    size: 24, color: active ? AppColors.brand : AppColors.textFaint),
                const SizedBox(height: 3),
                Text(label,
                    style: AppText.tiny(
                        c: active ? AppColors.brand : AppColors.textFaint,
                        w: active ? FontWeight.w700 : FontWeight.w500)),
              ]),
            ),
          );
        }),
      ),
    );
  }
}
