import { expect, test } from "bun:test"
import { Schema } from "effect"
import { AgentV2 } from "@apt5/core/agent"
import { Location as CoreLocation } from "@apt5/core/location"
import { ModelV2 } from "@apt5/core/model"
import { SessionV2 } from "@apt5/core/session"
import { SessionInput as CoreSessionInput } from "@apt5/core/session/input"
import { SessionMessage as CoreSessionMessage } from "@apt5/core/session/message"
import { Prompt as CorePrompt } from "@apt5/core/session/prompt"
import { Agent } from "@apt5/schema/agent"
import { Location } from "@apt5/schema/location"
import { Model } from "@apt5/schema/model"
import { Project } from "@apt5/schema/project"
import { Provider } from "@apt5/schema/provider"
import { Prompt } from "@apt5/schema/prompt"
import { Session } from "@apt5/schema/session"
import { SessionInput } from "@apt5/schema/session-input"
import { SessionMessage } from "@apt5/schema/session-message"
import { Workspace } from "@apt5/schema/workspace"
import { Api } from "@apt5/server/api"
import { compile, emitPromise } from "@apt5/httpapi-codegen"
import { ClientApi, endpointNames, groupNames, omitEndpoints } from "../src/contract"

test("Core and Server reuse the authoritative Schema and Protocol values", () => {
  expect(AgentV2.ID).toBe(Agent.ID)
  expect(CoreLocation.Ref).toBe(Location.Ref)
  expect(ModelV2.Ref).toBe(Model.Ref)
  expect(SessionV2.Info).toBe(Session.Info)
  expect(CoreSessionInput.Admitted).toBe(SessionInput.Admitted)
  expect(CoreSessionMessage.Message).toBe(SessionMessage.Message)
  expect(CorePrompt).toBe(Prompt)
  expect(Api.groups["server.session"].identifier).toBe("server.session")
  expect(Object.keys(ClientApi.groups)).toEqual(Object.keys(Api.groups))
  expect(Session.ID.create()).toStartWith("ses_")
  expect(Project.ID.global).toBe("global")
  expect(Provider.ID.anthropic).toBe("anthropic")
  expect(Workspace.ID.create()).toStartWith("wrk_")
})

test("client and Server contracts generate identically", () => {
  const server = compile(Api, { groupNames, endpointNames, omitEndpoints })
  const client = compile(ClientApi, { groupNames, endpointNames, omitEndpoints })

  expect(emitPromise(client)).toEqual(emitPromise(server))
})

test("shared DTO schemas construct and decode plain objects", () => {
  const made = Prompt.make({ text: "hello" })
  const decoded = Schema.decodeUnknownSync(Prompt)({ text: "hello" })
  const content = Schema.decodeUnknownSync(SessionMessage.AssistantText)({ type: "text", id: "part_1", text: "hi" })

  expect(Object.getPrototypeOf(made)).toBe(Object.prototype)
  expect(Object.getPrototypeOf(decoded)).toBe(Object.prototype)
  expect(Object.getPrototypeOf(content)).toBe(Object.prototype)
  expect(Prompt.ast.annotations?.identifier).toBe("Prompt")
  expect(SessionMessage.AssistantText.ast.annotations?.identifier).toBe("Session.Message.Assistant.Text")
  expect(CoreSessionMessage.AssistantText).toBe(SessionMessage.AssistantText)
})
