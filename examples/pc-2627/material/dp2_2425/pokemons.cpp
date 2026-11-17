#include <bits/stdc++.h>
using namespace std;

signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int n;
  cin >> n;
  for (int i = 0; i < n; i++) {
    string city_name;
    cin >> city_name;
  }
  vector< vector<double> > dist(n, vector<double>(n));
  for (int i = 0; i < n; i++) {
    for (int j = 0; j < n; j++) {
      cin >> dist[i][j];
    }
  }
  vector< vector<double> > dp(n, vector<double>(1 << n, -1));
  int source = -1;
  const double INF = 1e18;
  auto Solve = [&](auto&& self, int node, int mask) {
    if (__builtin_popcount(mask) == n) {
      return dist[node][source];
    }
    double& res = dp[node][mask];
    if (res >= 0) return res;
    res = INF;
    for (int i = 0; i < n; i++) {
      if ((mask >> i) & 1) continue;
      int new_mask = mask | (1 << i);
      res = min(res, self(self, i, new_mask) + dist[node][i]);
    }
    return res;
  };
  double best_way = INF;
  for (source = 0; source < n; source++) {
    dp = vector< vector<double> > (n, vector<double>(1 << n, -1));
    best_way = min(best_way, Solve(Solve, source, 1 << source));
  }
  cout << best_way << '\n';
  return 0;
}
