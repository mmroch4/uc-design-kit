#include <bits/stdc++.h>
using namespace std;
 
const int EMPTY = 10;
vector<int> lim;
 
long long dp[20][2][EMPTY + 5];
 
long long count(int pos, int flag, int started, int last_digit) {
  if (pos < 0) return 1;
  if (flag && ~dp[pos][started][last_digit]) return dp[pos][started][last_digit];
  long long res = 0;
  if (!started) res += count(pos - 1, 1, 0, EMPTY);
  for (int i = (!started ? 1 : 0); i <= (flag ? 9 : lim[pos]); i++) {
    if (i != last_digit) {
      res += count(pos - 1, flag | (i < lim[pos]), 1, i);
    }
  }
  return (flag ? dp[pos][started][last_digit] = res : res);
}
 
long long count(long long n) {
  if (n < 0) return 0LL;
  lim.clear();
  while (n) {
    lim.emplace_back(n % 10);
    n /= 10;
  }
  return count( (int) lim.size() - 1, 0, 0, EMPTY);
}
 
signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  memset(dp, -1, sizeof(dp));
  long long a, b;
  cin >> a >> b;
  cout << count(b) - count(a - 1) << '\n';
  return 0;
}
