#include <bits/stdc++.h>
using namespace std;

signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int n, m;
  cin >> n >> m;
  vector< vector<int> > g(n);
  vector<int> in(n);
  for (int i = 0; i < m; i++) {
    int st, et;
    cin >> st >> et;
    --st; --et;
    g[st].emplace_back(et);
    ++in[et];
  }
  queue<int> q;
  vector<int> dp(n, 0);
  for (int i = 0; i < n; i++) {
    if (in[i] == 0) {
      q.emplace(i);
      dp[i] = 1;
    }
  }
  while (!q.empty()) {
    int node = q.front();
    q.pop();
    for (auto& nei : g[node]) {
      dp[nei] = max(dp[nei], 1 + dp[node]);
      --in[nei];
      if (in[nei] == 0) {
        q.emplace(nei);
      }
    }
  }
  cout << *max_element(dp.begin(), dp.end()) -1 << '\n';
  return 0;
}
