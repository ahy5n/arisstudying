// The small slice of course data the client-side timetable and slides
// screens need: module names, colours and topic titles.
import { getModules, getModuleTopics } from './content'

export interface ModuleOption {
  code: string
  name: string
  colour: string
  topics: { id: string; title: string }[]
}

export function getModuleOptions(): ModuleOption[] {
  return getModules().map((m) => ({
    code: m.code,
    name: m.name,
    colour: m.colour,
    topics: getModuleTopics(m.code).map((t) => ({ id: t.id, title: t.title })),
  }))
}
