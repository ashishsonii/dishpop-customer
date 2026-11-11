import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'state/app_state.dart';
import 'theme/tokens.dart';
import 'screens/splash.dart';
import 'screens/shell.dart';
import 'screens/home.dart';
import 'screens/search.dart';
import 'screens/orders.dart';
import 'screens/account.dart';
import 'screens/brand.dart';
import 'screens/item.dart';
import 'screens/cart.dart';
import 'screens/checkout.dart';
import 'screens/order.dart';
import 'screens/auth_phone.dart';
import 'screens/auth_verify.dart';
import 'screens/account_pages.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(const DishPopApp());
}

final _homeKey = GlobalKey<NavigatorState>();
final _searchKey = GlobalKey<NavigatorState>();
final _ordersKey = GlobalKey<NavigatorState>();
final _accountKey = GlobalKey<NavigatorState>();

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (c, s) => const SplashScreen()),
    StatefulShellRoute.indexedStack(
      builder: (c, s, shell) => AppShell(shell: shell),
      branches: [
        StatefulShellBranch(navigatorKey: _homeKey, routes: [
          GoRoute(path: '/home', builder: (c, s) => const HomeScreen()),
        ]),
        StatefulShellBranch(navigatorKey: _searchKey, routes: [
          GoRoute(path: '/search', builder: (c, s) => const SearchScreen()),
        ]),
        StatefulShellBranch(navigatorKey: _ordersKey, routes: [
          GoRoute(path: '/orders', builder: (c, s) => const OrdersScreen()),
        ]),
        StatefulShellBranch(navigatorKey: _accountKey, routes: [
          GoRoute(path: '/account', builder: (c, s) => const AccountScreen()),
        ]),
      ],
    ),
    GoRoute(path: '/brand/:id', builder: (c, s) => BrandScreen(s.pathParameters['id']!)),
    GoRoute(path: '/item/:id', builder: (c, s) => ItemScreen(s.pathParameters['id']!)),
    GoRoute(path: '/cart', builder: (c, s) => const CartScreen()),
    GoRoute(path: '/checkout', builder: (c, s) => const CheckoutScreen()),
    GoRoute(path: '/order/:id', builder: (c, s) => OrderScreen(s.pathParameters['id']!)),
    GoRoute(path: '/auth/phone', builder: (c, s) => const PhoneScreen()),
    GoRoute(path: '/auth/verify', builder: (c, s) => VerifyScreen(
          phone: s.uri.queryParameters['phone'] ?? '',
        )),
    GoRoute(path: '/account/profile', builder: (c, s) => const ProfilePage()),
    GoRoute(path: '/account/settings', builder: (c, s) => const SettingsPage()),
    GoRoute(path: '/account/payments', builder: (c, s) => const PaymentsPage()),
    GoRoute(path: '/account/help', builder: (c, s) => const HelpPage()),
    GoRoute(path: '/account/refer', builder: (c, s) => const ReferPage()),
    GoRoute(path: '/account/credits', builder: (c, s) => const CreditsPage()),
    GoRoute(path: '/account/offers', builder: (c, s) => const OffersPage()),
  ],
);

class DishPopApp extends StatelessWidget {
  const DishPopApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartState()),
        ChangeNotifierProvider(create: (_) => ZoneState()..locate()),
        ChangeNotifierProvider(create: (_) => AuthState()..restore()),
        ChangeNotifierProvider(create: (_) => OrdersState()),
      ],
      child: MaterialApp.router(
        title: 'DishPop',
        debugShowCheckedModeBanner: false,
        routerConfig: router,
        theme: ThemeData(
          scaffoldBackgroundColor: AppColors.bg,
          colorScheme: ColorScheme.fromSeed(seedColor: AppColors.brand, surface: AppColors.bg),
          useMaterial3: true,
          splashFactory: InkRipple.splashFactory,
          appBarTheme: AppBarTheme(
            backgroundColor: AppColors.bg,
            surfaceTintColor: Colors.transparent,
            elevation: 0,
            foregroundColor: AppColors.text,
            titleTextStyle: AppText.h2(),
            centerTitle: false,
          ),
        ),
      ),
    );
  }
}
