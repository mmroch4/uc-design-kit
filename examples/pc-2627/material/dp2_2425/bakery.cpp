#include <bits/stdc++.h>
using namespace std;

const int N = 35'005;
int cnt[N];

signed main() {
  ios::sync_with_stdio(0);
  cin.tie(0);
  int n, k;
  cin >> n >> k;
  vector<int> arr(n + 1);
  for (int i = 1; i <= n; i++) cin >> arr[i];
  const int INF = 1e9;
  vector< vector<int> > dp(n + 1, vector<int> (k + 1, -INF)); 
  dp[0][0] = 0;
  for (int i = 1; i <= n; i++) {
    for (int x = 1; x <= k; x++) {
      int unique_elements = 0;
      for (int j = i; j >= 1; j--) {
        ++cnt[ arr[j] ];
        if (cnt[ arr[j] ] == 1) ++unique_elements;
        // we are inserting a segment that covers from [j, i] and we want to use x segments
        dp[i][x] = max(dp[i][x], unique_elements + dp[j - 1][x - 1]);
      }
      for (int j = i; j >= 1; j--) {
        --cnt[ arr[j] ];
        if (cnt[ arr[j] ] == 0) --unique_elements;
      }
    }
  }
  cout << dp[n][k] << '\n';
  return 0;
}
