export const feedbackFields = ['food', 'hospitality', 'atmosphere', 'ordering', 'reservation', 'overall', 'recommendation'] as const
export type FeedbackField = typeof feedbackFields[number]
export type FeedbackRatings = Partial<Record<FeedbackField, number>>

export function cleanRatings(value: unknown): FeedbackRatings {
  const ratings: FeedbackRatings = {}
  if (!value || typeof value !== 'object') return ratings
  const input = value as Record<string, unknown>
  for (const field of feedbackFields) {
    const score = input[field]
    const valid = typeof score === 'number' && Number.isInteger(score)
      && (field === 'recommendation' ? score >= 0 && score <= 10 : score >= 1 && score <= 5)
    if (valid) ratings[field] = score
  }
  return ratings
}

export function summarizeFeedback(responses: readonly FeedbackRatings[]) {
  const ratings = Object.fromEntries(feedbackFields.map((field) => {
    const answers = responses.flatMap((response) => response[field] === undefined ? [] : [response[field]])
    return [field, { count: answers.length, average: answers.length ? answers.reduce((a, b) => a + b, 0) / answers.length : null }]
  })) as Record<FeedbackField, { count: number; average: number | null }>
  const recommendations = responses.flatMap(({ recommendation }) => recommendation === undefined ? [] : [recommendation])
  const promoters = recommendations.filter((score) => score >= 9).length
  const detractors = recommendations.filter((score) => score <= 6).length
  return {
    count: responses.length, ratings,
    nps: recommendations.length ? Math.round(100 * (promoters - detractors) / recommendations.length) : null,
  }
}
