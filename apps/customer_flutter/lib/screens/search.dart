import 'package:flutter/material.dart';
import '../data/models.dart';
import '../theme/tokens.dart';
import '../widgets/cards.dart';
import '../widgets/cart_bar.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});
  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  String q = '';
  @override
  Widget build(BuildContext context) {
    final all = dishesInZone();
    final results = q.isEmpty
        ? all
        : all.where((d) {
            final b = brandById(d.brandId)!;
            final hay = '${d.name} ${d.category} ${b.name}'.toLowerCase();
            return hay.contains(q.toLowerCase());
          }).toList();
    return SafeArea(
      bottom: false,
      child: Stack(children: [
        Column(children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(Space.lg, Space.md, Space.lg, Space.sm),
            child: Container(
              height: 48,
              padding: const EdgeInsets.symmetric(horizontal: Space.md),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(Radii.md),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(children: [
                const Icon(Icons.search, size: 20, color: AppColors.textMuted),
                const SizedBox(width: Space.sm),
                Expanded(
                  child: TextField(
                    autofocus: false,
                    onChanged: (v) => setState(() => q = v),
                    style: AppText.body(),
                    decoration: InputDecoration(
                      isCollapsed: true,
                      border: InputBorder.none,
                      hintText: 'Search dishes, brands…',
                      hintStyle: AppText.body(c: AppColors.textFaint),
                    ),
                  ),
                ),
                if (q.isNotEmpty)
                  GestureDetector(
                    onTap: () => setState(() => q = ''),
                    child: const Icon(Icons.close, size: 18, color: AppColors.textMuted),
                  ),
              ]),
            ),
          ),
          Expanded(
            child: results.isEmpty
                ? Center(child: Text('No results for "$q"', style: AppText.body(c: AppColors.textMuted)))
                : GridView.builder(
                    padding: const EdgeInsets.fromLTRB(Space.lg, Space.sm, Space.lg, 120),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, crossAxisSpacing: Space.md, childAspectRatio: 0.64),
                    itemCount: results.length,
                    itemBuilder: (c, i) => DishCard(results[i], double.infinity),
                  ),
          ),
        ]),
        const Positioned(left: 0, right: 0, bottom: 0, child: CartBar()),
      ]),
    );
  }
}
