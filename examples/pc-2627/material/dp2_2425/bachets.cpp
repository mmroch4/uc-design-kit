#include <bits/stdc++.h>
using namespace std;
 
signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int target_value;
  int number_stones;
  while (cin >> target_value) {
    cin >> number_stones;
    vector<int> stones(number_stones);
    for (auto& stone : stones) cin >> stone;
    vector<int> winning(target_value + 1);
    winning[0] = 0;
    for (int i = 1; i <= target_value; i++) {
      for (auto& stone : stones) {
        if (i - stone >= 0) winning[i] |= !winning[i - stone];
      }
    }
    cout << (winning[target_value] ? "Stan wins" : "Ollie wins") << '\n';
  }
  return 0;
}

