import 'package:flutter_test/flutter_test.dart';

import 'package:customer/data/models.dart';

void main() {
  test('rupees formats paise to ₹', () {
    expect(rupees(19900), '₹199');
    expect(rupees(100000), '₹1,000');
  });

  test('catalog has brands and dishes', () {
    expect(brandsInZone().isNotEmpty, true);
    expect(dishesInZone().isNotEmpty, true);
  });
}
