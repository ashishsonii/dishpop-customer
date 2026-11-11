import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../data/models.dart';
import '../theme/tokens.dart';

Color vegColor(Veg v) =>
    v == Veg.veg ? AppColors.veg : v == Veg.egg ? AppColors.egg : AppColors.nonVeg;

class VegDot extends StatelessWidget {
  final Veg veg;
  final double size;
  const VegDot(this.veg, {this.size = 16, super.key});
  @override
  Widget build(BuildContext context) {
    final c = vegColor(veg);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        border: Border.all(color: c, width: 1.5),
        borderRadius: BorderRadius.circular(3),
      ),
      child: Center(
        child: Container(
          width: size * 0.5,
          height: size * 0.5,
          decoration: BoxDecoration(color: c, shape: BoxShape.circle),
        ),
      ),
    );
  }
}

const _tagLabel = {
  'bestseller': 'BESTSELLER',
  'new': 'NEW',
  'spicy': 'SPICY',
  'popular': 'POPULAR',
};
const _tagIcon = {
  'bestseller': Icons.star,
  'new': Icons.auto_awesome,
  'spicy': Icons.local_fire_department,
  'popular': Icons.trending_up,
};

class TagLabel extends StatelessWidget {
  final String tag;
  const TagLabel(this.tag, {super.key});
  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(_tagIcon[tag], size: 11, color: AppColors.text),
      const SizedBox(width: 4),
      Text(_tagLabel[tag] ?? tag,
          style: AppText.tiny(c: AppColors.text).copyWith(letterSpacing: 0.4)),
    ]);
  }
}

class RatingPill extends StatelessWidget {
  final double rating;
  const RatingPill(this.rating, {super.key});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
          color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.sm)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.star, size: 11, color: Colors.white),
        const SizedBox(width: 3),
        Text(rating.toStringAsFixed(1),
            style: AppText.tiny(c: Colors.white)),
      ]),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String label;
  const SectionHeader(this.label, {super.key});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Space.lg, Space.xl, Space.lg, Space.md),
      child: Row(children: [
        Text(label.toUpperCase(),
            style: AppText.small(c: AppColors.textMuted, w: FontWeight.w700)
                .copyWith(letterSpacing: 0.8)),
        const SizedBox(width: Space.md),
        Expanded(child: Container(height: 1, color: AppColors.border)),
      ]),
    );
  }
}

class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool loading;
  final IconData? icon;
  const PrimaryButton(this.label, {this.onTap, this.loading = false, this.icon, super.key});
  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null && !loading;
    return GestureDetector(
      onTap: enabled
          ? () {
              HapticFeedback.lightImpact();
              onTap!();
            }
          : null,
      child: Container(
        height: 52,
        decoration: BoxDecoration(
          color: enabled ? AppColors.brand : AppColors.textFaint,
          borderRadius: BorderRadius.circular(Radii.md),
        ),
        alignment: Alignment.center,
        child: loading
            ? const SizedBox(
                width: 22, height: 22,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
            : Row(mainAxisSize: MainAxisSize.min, children: [
                if (icon != null) ...[Icon(icon, color: Colors.white, size: 18), const SizedBox(width: 8)],
                Text(label, style: AppText.h3(c: Colors.white)),
              ]),
      ),
    );
  }
}

/// ADD button that flips to a − qty + stepper.
class AddStepper extends StatelessWidget {
  final int qty;
  final VoidCallback onAdd, onInc, onDec;
  final bool extendable;
  const AddStepper(
      {required this.qty,
      required this.onAdd,
      required this.onInc,
      required this.onDec,
      this.extendable = false,
      super.key});
  @override
  Widget build(BuildContext context) {
    if (qty == 0) {
      return GestureDetector(
        onTap: () {
          HapticFeedback.selectionClick();
          onAdd();
        },
        child: Container(
          constraints: const BoxConstraints(minWidth: 96),
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.card,
            border: Border.all(color: AppColors.border),
            borderRadius: BorderRadius.circular(Radii.md),
            boxShadow: cardShadow(),
          ),
          alignment: Alignment.center,
          child: Text('ADD${extendable ? '  +' : ''}',
              style: AppText.h3(c: AppColors.brand)),
        ),
      );
    }
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.brand,
        borderRadius: BorderRadius.circular(Radii.md),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        _stepBtn(Icons.remove, () { HapticFeedback.selectionClick(); onDec(); }),
        SizedBox(
          width: 28,
          child: Text('$qty',
              textAlign: TextAlign.center,
              style: AppText.h3(c: Colors.white)),
        ),
        _stepBtn(Icons.add, () { HapticFeedback.selectionClick(); onInc(); }),
      ]),
    );
  }

  Widget _stepBtn(IconData i, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Icon(i, size: 18, color: Colors.white),
        ),
      );
}

/// dishp●p wordmark — the o in pop is a solid dot.
class Wordmark extends StatelessWidget {
  final double size;
  final Color color;
  const Wordmark({this.size = 40, this.color = AppColors.text, super.key});
  @override
  Widget build(BuildContext context) {
    final dot = size * 0.62;
    final letter = poppins(size: size, weight: FontWeight.w800, color: color)
        .copyWith(letterSpacing: -size * 0.05, height: 1);
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text('dishp', style: letter),
        Container(
          width: dot,
          height: dot,
          margin: EdgeInsets.only(bottom: size * 0.12, left: size * 0.02, right: size * 0.02),
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        Text('p', style: letter),
      ],
    );
  }
}
