<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Feedback;

class DashboardController extends Controller
{
    public function getDashboardStats(Request $request)
    {
        $month = $request->input('month'); // Format: "2025-01"
        $staffId = $request->input('staff_id');

        if (!$month) {
            return response()->json(['error' => 'Month parameter is required'], 400);
        }

        try {
            // Selected month range
            $startOfMonth = Carbon::parse($month . '-01')->startOfMonth();
            $endOfMonth   = Carbon::parse($month . '-01')->endOfMonth();

            // Previous month range
            $previousMonthStart = (clone $startOfMonth)->subMonth()->startOfMonth();
            $previousMonthEnd   = (clone $startOfMonth)->subMonth()->endOfMonth();

            // Base queries
            $monthlyQuery  = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            $previousQuery = Feedback::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd]);
            $allTimeQuery  = Feedback::query();

            // Monthly stats
            $verySatisfiedMonth = (clone $monthlyQuery)->where('value', 4)->count();
            $satisfiedMonth     = (clone $monthlyQuery)->where('value', 3)->count();
            $neutralMonth       = (clone $monthlyQuery)->where('value', 2)->count();
            $negativeMonth      = (clone $monthlyQuery)->where('value', 1)->count();
            $totalMonth         = $verySatisfiedMonth + $satisfiedMonth + $neutralMonth + $negativeMonth;

            // Previous month stats
            $verySatisfiedPrev = (clone $previousQuery)->where('value', 4)->count();
            $satisfiedPrev     = (clone $previousQuery)->where('value', 3)->count();
            $neutralPrev       = (clone $previousQuery)->where('value', 2)->count();
            $negativePrev      = (clone $previousQuery)->where('value', 1)->count();
            $totalPrev         = $verySatisfiedPrev + $satisfiedPrev + $neutralPrev + $negativePrev;

            // All-time stats
            $verySatisfiedAll = (clone $allTimeQuery)->where('value', 4)->count();
            $satisfiedAll     = (clone $allTimeQuery)->where('value', 3)->count();
            $neutralAll       = (clone $allTimeQuery)->where('value', 2)->count();
            $negativeAll      = (clone $allTimeQuery)->where('value', 1)->count();
            $totalAll         = $verySatisfiedAll + $satisfiedAll + $neutralAll + $negativeAll;

            // Trend helper (same style as your getMonthlyStats)
            $calculateTrend = function ($current, $previous) {
                if ($previous == 0) {
                    return $current > 0 ? 100 : 0;
                }
                return round((($current - $previous) / $previous) * 100, 1);
            };

            // Average helper (weighted average -> percent)
            $calculateAveragePercentage = function ($verySatisfied, $satisfied, $neutral, $negative, $total) {
                if ($total == 0) return 0;

                $weightedSum = ($verySatisfied * 4)
                             + ($satisfied * 3)
                             + ($neutral * 2)
                             + ($negative * 1);

                $avg = $weightedSum / $total;     // 1..4
                return ($avg / 4) * 100;          // 0..100
            };

            $currentAverage  = $calculateAveragePercentage(
                $verySatisfiedMonth, $satisfiedMonth, $neutralMonth, $negativeMonth, $totalMonth
            );
            $previousAverage = $calculateAveragePercentage(
                $verySatisfiedPrev, $satisfiedPrev, $neutralPrev, $negativePrev, $totalPrev
            );

            $averageDifference = $currentAverage - $previousAverage;

            // Donut data (filter out zero)
            $donut = [
                ['name' => 'Rất hài lòng',   'value' => $verySatisfiedMonth, 'color' => '#3cb051'],
                ['name' => 'Hài lòng',       'value' => $satisfiedMonth,     'color' => '#8ec962'],
                ['name' => 'Bình thường',    'value' => $neutralMonth,       'color' => '#faaf42'],
                ['name' => 'Không hài lòng', 'value' => $negativeMonth,      'color' => '#e1242a'],
            ];

            $donut = array_values(array_filter($donut, function ($item) {
                return $item['value'] > 0;
            }));

            return response()->json([
                'status' => true,
                'month' => $month,
                'staff_id' => $staffId,

                'kpi' => [
                    'current' => [
                        'total' => $totalMonth,
                        'very_satisfied' => $verySatisfiedMonth,
                        'satisfied' => $satisfiedMonth,
                        'neutral' => $neutralMonth,
                        'negative' => $negativeMonth,
                    ],
                    'previous' => [
                        'total' => $totalPrev,
                        'very_satisfied' => $verySatisfiedPrev,
                        'satisfied' => $satisfiedPrev,
                        'neutral' => $neutralPrev,
                        'negative' => $negativePrev,
                    ],
                    'all_time' => [
                        'total' => $totalAll,
                        'very_satisfied' => $verySatisfiedAll,
                        'satisfied' => $satisfiedAll,
                        'neutral' => $neutralAll,
                        'negative' => $negativeAll,
                    ],
                    'trends' => [
                        'very_satisfied' => $calculateTrend($verySatisfiedMonth, $verySatisfiedPrev),
                        'satisfied' => $calculateTrend($satisfiedMonth, $satisfiedPrev),
                        'neutral' => $calculateTrend($neutralMonth, $neutralPrev),
                        'negative' => $calculateTrend($negativeMonth, $negativePrev),
                    ],
                ],

                'average' => [
                    'current_percentage' => round($currentAverage, 1),
                    'previous_percentage' => round($previousAverage, 1),
                    'difference' => round($averageDifference, 1),
                ],

                'donut_data' => $donut,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid month format'], 400);
        }
    }
}
