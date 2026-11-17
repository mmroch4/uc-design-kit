#include <bits/stdc++.h>
using namespace std;

const int N = 1e5 + 5;
const int MOD = 1e9 + 7;

int add(int a, int b) {
  int res = a + b;
  if (res >= MOD) res -= MOD;
  return res;
}

int mult(int a, int b) {
  long long res = 1LL * a * b;
  if (res >= MOD) res %= MOD;
  return res;
}

vector< vector<int> > g(N);
int dp[N][2];

void dfs(int node, int p) {
  int is_leaf = 1;
  for (auto& nei : g[node]) {
    if (nei == p) continue;
    dfs(nei, node);
    is_leaf = 0;
  }
  if (is_leaf) {
    dp[node][0] = 1;
    dp[node][1] = 1;
  } else {
    // assume we will colour in white
    {
      dp[node][0] = 1;
      for (auto& nei : g[node]) {
        if (nei == p) continue;
        dp[node][0] = mult(dp[node][0], add(dp[nei][0], dp[nei][1]));
      }
    }
    // assume we will colour in black
    {
      dp[node][1] = 1;
      for (auto& nei : g[node]) {
        if (nei == p) continue;
        dp[node][1] = mult(dp[node][1], dp[nei][0]);
      }
    }
  }
}

signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int n;
  cin >> n;
  for (int i = 0; i < n - 1; i++) {
    int s, t;
    cin >> s >> t;
    --s; --t;
    g[s].emplace_back(t);
    g[t].emplace_back(s);
  }
  dfs(0, -1);
  cout << add(dp[0][0], dp[0][1]) << '\n'; 
  return 0;
}
