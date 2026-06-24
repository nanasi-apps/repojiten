import "@typespec/http";
import "@typespec/openapi";

using Http;
using TypeSpec.OpenAPI;

namespace Repojiten.ApiV1;

@tag("users")
@summary("List all users")
@operationId("listUsers")
@get
@route("/users")
op listUsers(): {
  @statusCode statusCode: 200;
  @body body: Repojiten.User[];
};

@tag("users")
@summary("Create a new user")
@operationId("createUser")
@post
@route("/users")
op createUser(@body body: Repojiten.CreateUserInput):
  | {
      @statusCode statusCode: 201;
      @body body: Repojiten.User;
    }
  | {
      @statusCode statusCode: 400;
      @body body: Repojiten.ErrorResponse;
    };

@tag("users")
@summary("Get a user by id")
@operationId("getUser")
@get
@route("/users/{id}")
op getUser(@path id: int64):
  | {
      @statusCode statusCode: 200;
      @body body: Repojiten.User;
    }
  | {
      @statusCode statusCode: 400;
      @body body: Repojiten.ErrorResponse;
    }
  | {
      @statusCode statusCode: 404;
      @body body: Repojiten.ErrorResponse;
    };
