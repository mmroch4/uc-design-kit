#include <bits/stdc++.h>
using namespace std;
 
const long long NOT_CALCULATED = 1e18 + 5;
const long long INF = 1e18;
 
const int N = 5e3 + 5;
 
long long dp[N][N];
int arr[N];
 
int n;
 
long long solve(int l, int r) {
    if (l > r) return 0;
    if (dp[l][r] != NOT_CALCULATED) return dp[l][r];
    
    int moves = l + (n - 1 - r);
    if ( (moves % 2) == 0) {
        long long best_way = -INF;
        best_way = max(best_way, solve(l + 1, r) + arr[l]);
        best_way = max(best_way, solve(l, r - 1) + arr[r]);
        dp[l][r]  = best_way;
        return best_way;
    } else {
        long long best_way = +INF;
        best_way = min(best_way, solve(l + 1, r) );
        best_way = min(best_way, solve(l, r - 1) );
        dp[l][r]  = best_way;
        return best_way;
    }
}
 
int main() {
    cin >> n;
    for (int i = 0; i < n; i++) cin >> arr[i];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            dp[i][j] = NOT_CALCULATED;
        }
    }
    cout << solve(0, n - 1) << endl;
}