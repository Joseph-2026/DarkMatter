export * as PublicEventManifest from "./public-event-manifest"

import { Event } from "@apt5/schema/event"
import { EventManifest } from "@apt5/schema/event-manifest"

export const Definitions = EventManifest.ServerDefinitions
export const Latest = Event.latest(Definitions)
