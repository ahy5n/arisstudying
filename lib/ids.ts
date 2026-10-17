// Stable ids for practice items that don't carry their own id in content.
export const flashcardId = (topicId: string, i: number) => `${topicId}:fc${i + 1}`
export const caseId = (topicId: string, i: number) => `${topicId}:case${i + 1}`
