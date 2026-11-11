import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// DishPop design tokens — CRED/EatClub-style monochrome.
/// Near-black + white + grey; only functional colour is veg/non-veg.
class AppColors {
  static const bg = Color(0xFFFFFFFF);
  static const surface = Color(0xFFF7F8F9);
  static const card = Color(0xFFFFFFFF);
  static const text = Color(0xFF191A1C);
  static const textMuted = Color(0xFF6B6E72);
  static const textFaint = Color(0xFF9A9DA3);
  static const border = Color(0xFFE6E7E9);
  static const brand = Color(0xFF0E0E10); // ink — primary
  static const brandDark = Color(0xFF000000);
  static const brandSoft = Color(0xFFF1F1F3);
  static const onBrand = Color(0xFFFFFFFF);
  static const veg = Color(0xFF1A7F37);
  static const nonVeg = Color(0xFFC5221F);
  static const egg = Color(0xFFB07A00);
  static const success = Color(0xFF1A7F37);
  static const successSoft = Color(0xFFE7F4EC);
  static const gold = Color(0xFF6E56CF); // tiny purple accent (unused-ish)
  static const goldSoft = Color(0xFFF3F0FD);
}

class Space {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const xxl = 32.0;
}

class Radii {
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const pill = 999.0;
}

/// Poppins type helpers.
TextStyle poppins({
  double size = 14,
  FontWeight weight = FontWeight.w500,
  Color color = AppColors.text,
  double? height,
  double? letterSpacing,
}) =>
    GoogleFonts.poppins(
      fontSize: size,
      fontWeight: weight,
      color: color,
      height: height,
      letterSpacing: letterSpacing,
    );

class AppText {
  static TextStyle display({Color c = AppColors.text}) =>
      poppins(size: 28, weight: FontWeight.w800, color: c, height: 1.15);
  static TextStyle h1({Color c = AppColors.text}) =>
      poppins(size: 22, weight: FontWeight.w800, color: c, height: 1.2);
  static TextStyle h2({Color c = AppColors.text}) =>
      poppins(size: 18, weight: FontWeight.w700, color: c, height: 1.25);
  static TextStyle h3({Color c = AppColors.text}) =>
      poppins(size: 15, weight: FontWeight.w700, color: c, height: 1.3);
  static TextStyle body({Color c = AppColors.text, FontWeight w = FontWeight.w500}) =>
      poppins(size: 14, weight: w, color: c, height: 1.4);
  static TextStyle small({Color c = AppColors.textMuted, FontWeight w = FontWeight.w500}) =>
      poppins(size: 12, weight: w, color: c, height: 1.35);
  static TextStyle tiny({Color c = AppColors.textMuted, FontWeight w = FontWeight.w600}) =>
      poppins(size: 11, weight: w, color: c, height: 1.3);
}

/// Soft card shadow.
List<BoxShadow> cardShadow() => [
      BoxShadow(
        color: Colors.black.withValues(alpha: 0.05),
        blurRadius: 10,
        offset: const Offset(0, 3),
      ),
    ];
