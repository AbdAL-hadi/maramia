import { sources } from './marketingAnalytics'
import type { MarketingFilters, MarketingMetrics } from './marketingMetrics'

export function aggregateCsv(metrics: MarketingMetrics, filters: MarketingFilters, dataset: 'local' | 'sample') {
  const rows: (string | number)[][] = [
    ['dataset', dataset === 'sample' ? 'synthetic_sample' : 'local_interactions'],
    ['time_zone', 'Asia/Dubai'], ['from', filters.from], ['to', filters.to],
    ['campaign_filter', filters.campaignId || 'all'], ['source_filter', filters.source || 'all'], [],
    ['metric', 'value'], ['unique_sessions', metrics.sessions], ['campaign_visits', metrics.campaignVisits],
    ['demo_orders', metrics.orders], ['active_demo_reservations', metrics.reservations], ['demo_revenue_AED', metrics.revenue / 100],
    ['average_order_AED', metrics.average / 100], ['order_conversion_rate', metrics.orderRate],
    ['reservation_conversion_rate', metrics.reservationRate], ['promo_redemptions', metrics.redemptions],
    ['quiz_completion_rate', metrics.quizRate], ['quiz_starting_sessions', metrics.quizStarted], ['quiz_completing_sessions', metrics.quizCompleted],
    [], ['funnel_stage', 'unique_sessions'],
    ...['campaign_visit', 'menu_engagement', 'add_to_cart', 'checkout_started', 'completed_order'].map((key, index) => [key, metrics.funnel[index]]),
    [], ['campaign', 'visits', 'unique_visitor_sessions', 'orders', 'reservations', 'order_conversion_rate', 'reservation_conversion_rate', 'demo_revenue_AED'],
    ...metrics.campaignRows.map((row) => [row.campaign.id, row.visits, row.visitorSessions, row.orders, row.reservations, row.orderRate, row.reservationRate, row.revenue / 100]),
    [], ['acquisition_source', 'sessions_with_visit'],
    ...sources.map((source) => [source, metrics.acquisition.find((entry) => entry.source === source)?.visits ?? 0]),
    [], ['referral_code', 'visits', 'demo_orders', 'active_demo_reservations'],
    ...metrics.referralRows.map(({ code, visits, orders, reservations }) => [code, visits, orders, reservations]),
    [], ['menu_item_most_viewed', 'views'], ...metrics.viewed,
    [], ['menu_item_most_ordered', 'units'], ...metrics.ordered,
    [], ['quiz_question', 'answer', 'sessions'],
    ...metrics.preferences.flatMap(({ field, counts }) => counts.map(([answer, value]) => [field, answer, value])),
    [], ['dubai_date', 'demo_revenue_AED'], ...metrics.daily.map(([date, value]) => [date, value / 100]),
    [], ['retention_metric', 'value'],
    ['eligible_completed_orders', metrics.retention.eligibleOrders], ['repeat_order_rate', metrics.retention.repeatRate],
    ['average_eligible_order_AED', metrics.retention.average / 100], ['repeat_demo_revenue_AED', metrics.retention.repeatRevenue / 100],
    ['reward_redemptions', metrics.retention.redemptions], ['points_redeemed', metrics.retention.pointsRedeemed],
    [], ['reward', 'redemptions'], ...metrics.retention.distribution,
    [], ['demo_activity', 'count'],
    ['graphics_exported', metrics.tools.graphics], ['campaign_links_generated', metrics.tools.links],
    ['qr_cards_generated', metrics.tools.qr], ['gift_card_previews', metrics.tools.giftPreviews], ['demo_gift_cards_generated', metrics.tools.gifts],
    ['feedback_responses', metrics.feedback.count],
    [], ['feedback_rating', 'answers', 'mean'],
    ...Object.entries(metrics.feedback.ratings).map(([key, values]) => [key, values.count, values.average ?? '']),
    ['net_promoter_score', metrics.feedback.ratings.recommendation.count, metrics.feedback.nps ?? ''],
  ]
  return rows.map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(',')).join('\r\n')
}

export function downloadAggregateCsv(metrics: MarketingMetrics, filters: MarketingFilters, dataset: 'local' | 'sample') {
  const url = URL.createObjectURL(new Blob(['\ufeff', aggregateCsv(metrics, filters, dataset)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'maramia-marketing-' + dataset + '.csv'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
