#include <bits/stdc++.h>
using namespace std;
 
signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int n; 
  cin >> n;
  vector<int> arr(n);
  for (auto& value : arr) cin >> value;
  const long long INF = 1e18;
  const long long EMPTY = 1e16;
  vector< vector<long long> > dp(n, vector<long long>(n, EMPTY));
  auto Solve = [&](auto&& self, int l, int r) -> long long {
    if (l > r) return 0LL;
    
    long long& res = dp[l][r];
    if (res != EMPTY) return res;
    
    int turn = l + (n - 1 - r);
    
    if (turn & 1) { // odd
      res = INF;
      res = min(res, self(self, l + 1, r) );
      res = min(res, self(self, l, r - 1) );
    } else { // even
      res = -INF;
      res = max(res, self(self, l + 1, r) + arr[l]);
      res = max(res, self(self, l, r - 1) + arr[r]);
    }
    return res;
  };
  cout << Solve(Solve, 0, n - 1) << '\n';
  return 0;
}
