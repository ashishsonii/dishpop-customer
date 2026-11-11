import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../data/models.dart';
import '../state/app_state.dart';
import '../theme/tokens.dart';
import '../widgets/common.dart';

class ItemScreen extends StatefulWidget {
  final String id;
  const ItemScreen(this.id, {super.key});
  @override
  State<ItemScreen> createState() => _ItemScreenState();
}

class _ItemScreenState extends State<ItemScreen> {
  final Map<String, Set<String>> _selected = {};

  @override
  void initState() {
    super.initState();
    final dish = dishById(widget.id);
    if (dish != null) {
      for (final g in dish.addons) {
        _selected[g.id] = {};
        // preselect first option of required single-choice groups
        if (g.min >= 1 && g.max == 1 && g.options.isNotEmpty) {
          _selected[g.id] = {g.options.first.id};
        }
      }
    }
  }

  void _toggle(AddonGroup g, AddonOption o) {
    setState(() {
      final sel = _selected[g.id]!;
      if (g.max == 1) {
        _selected[g.id] = {o.id};
      } else {
        if (sel.contains(o.id)) {
          sel.remove(o.id);
        } else if (sel.length < g.max) {
          sel.add(o.id);
        }
      }
    });
  }

  bool get _valid {
    final dish = dishById(widget.id)!;
    for (final g in dish.addons) {
      if ((_selected[g.id]?.length ?? 0) < g.min) return false;
    }
    return true;
  }

  List<AddonOption> get _chosen {
    final dish = dishById(widget.id)!;
    final out = <AddonOption>[];
    for (final g in dish.addons) {
      for (final o in g.options) {
        if (_selected[g.id]?.contains(o.id) == true) out.add(o);
      }
    }
    return out;
  }

  @override
  Widget build(BuildContext context) {
    final dish = dishById(widget.id);
    if (dish == null) return const Scaffold(body: Center(child: Text('Not found')));
    final off = offeringFor(dish.id)!;
    final addonTotal = _chosen.fold(0, (a, x) => a + x.price);
    final total = off.price + addonTotal;

    return Scaffold(
      appBar: AppBar(
        title: Text(dish.name, style: AppText.h3()),
        leading: IconButton(icon: const Icon(Icons.close), onPressed: () => context.pop()),
      ),
      body: ListView(padding: EdgeInsets.zero, children: [
        Image.asset(dish.image, height: 200, width: double.infinity, fit: BoxFit.cover),
        Padding(
          padding: const EdgeInsets.all(Space.lg),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [VegDot(dish.veg, size: 16), const SizedBox(width: 6), Expanded(child: Text(dish.name, style: AppText.h1()))]),
            const SizedBox(height: 4),
            Text(dish.description, style: AppText.body(c: AppColors.textMuted)),
            const SizedBox(height: 6),
            Text(rupees(off.price), style: AppText.h2()),
            for (final g in dish.addons) ...[
              const SizedBox(height: Space.xl),
              Row(children: [
                Text(g.name, style: AppText.h3()),
                const SizedBox(width: Space.sm),
                Text(g.min >= 1 ? 'Required' : 'Optional',
                    style: AppText.tiny(c: g.min >= 1 ? AppColors.nonVeg : AppColors.textMuted, w: FontWeight.w600)),
              ]),
              const SizedBox(height: Space.sm),
              ...g.options.map((o) {
                final sel = _selected[g.id]?.contains(o.id) == true;
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => _toggle(g, o),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: Space.sm),
                    child: Row(children: [
                      Icon(
                        g.max == 1
                            ? (sel ? Icons.radio_button_checked : Icons.radio_button_off)
                            : (sel ? Icons.check_box : Icons.check_box_outline_blank),
                        size: 22, color: sel ? AppColors.brand : AppColors.textFaint,
                      ),
                      const SizedBox(width: Space.md),
                      Expanded(child: Text(o.name, style: AppText.body())),
                      if (o.price > 0) Text('+ ${rupees(o.price)}', style: AppText.small(w: FontWeight.w600)),
                    ]),
                  ),
                );
              }),
            ],
          ]),
        ),
        const SizedBox(height: 90),
      ]),
      bottomSheet: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(Space.lg),
          child: PrimaryButton(
            'Add to cart  ·  ${rupees(total)}',
            onTap: _valid
                ? () {
                    context.read<CartState>().add(dish, off.price, off.mrp, addons: _chosen);
                    context.pop();
                  }
                : null,
          ),
        ),
      ),
    );
  }
}
