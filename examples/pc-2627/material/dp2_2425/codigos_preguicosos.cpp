#include <bits/stdc++.h>
using namespace std;
 
int dp[20][2][1 << 10];

int different_digits;

vector<int> lim;

long long solve(int p, int flag, int started, int mask) {
  if (p < 0) return __builtin_popcount(mask) <= different_digits;
  if (flag && ~dp[p][started][mask]) return dp[p][started][mask];
  long long res = 0;
  if (!started) res += solve(p - 1, 1, 0, 0);
  for (int i = (started ? 0 : 1); i <= (flag ? 9 : lim[p]); i++) {
    int new_mask = mask | (1 << i);
    res += solve(p - 1, flag | (i < lim[p]), 1, new_mask);
  } 
  return (flag ? dp[p][started][mask] = res : res);
}

long long solve(long long n) {
  lim.clear();
  while (n) {
    lim.emplace_back(n % 10);
    n /= 10;
  }
  return solve( (int) lim.size() - 1, 0, 0, 0);
}

signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int tt;
  cin >> tt;
  while (tt--) {
    long long l, r;
    cin >> l >> r >> different_digits;
    memset(dp, -1, sizeof(dp));
    cout << solve(r) - solve(l - 1) << '\n';
  }
  return 0;
}
