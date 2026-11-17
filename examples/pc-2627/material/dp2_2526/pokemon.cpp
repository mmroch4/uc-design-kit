#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<string> cities(n);
    for (int i = 0; i < n; i++) cin >> cities[i];
    vector< vector<double> > dist(n, vector<double>(n));
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cin >> dist[i][j];
        }
    }
    const double NOT_CALCULATED = -1;
    vector< vector<double> > dp(n, vector<double>(1 << n, NOT_CALCULATED));
    auto solve = [&](auto&& self, int node, int mask) -> double {
        if (__builtin_popcount(mask) == n) return dist[node][0];
        if (dp[node][mask] != NOT_CALCULATED) return dp[node][mask];
        double best_way = 1e9;
        for (int i = 0; i < n; i++) {
            if ((mask >> i) & 1) continue;
            best_way = min(best_way,
            dist[node][i] + self(self, i, mask | (1 << i))
            );
        }
        dp[node][mask] = best_way;
        return best_way;
    };
    cout << solve(solve, 0, 1 << 0) << endl;
    return 0;
}