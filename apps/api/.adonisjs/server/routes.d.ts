import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'auth.sign_up': { paramsTuple?: []; params?: {} }
    'auth.verify_email': { paramsTuple?: []; params?: {} }
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.forgot_password': { paramsTuple?: []; params?: {} }
    'auth.reset_password': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.delete_account': { paramsTuple?: []; params?: {} }
    'auth.profile': { paramsTuple?: []; params?: {} }
    'auth.update_profile': { paramsTuple?: []; params?: {} }
    'uploads.store': { paramsTuple?: []; params?: {} }
    'employees.index': { paramsTuple?: []; params?: {} }
    'employees.store': { paramsTuple?: []; params?: {} }
    'employees.create_many': { paramsTuple?: []; params?: {} }
    'employees.update_many': { paramsTuple?: []; params?: {} }
    'employees.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employees.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'employees.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.index': { paramsTuple?: []; params?: {} }
    'housings.store': { paramsTuple?: []; params?: {} }
    'housings.create_many': { paramsTuple?: []; params?: {} }
    'housings.update_many': { paramsTuple?: []; params?: {} }
    'housings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.index': { paramsTuple?: []; params?: {} }
    'reservations.store': { paramsTuple?: []; params?: {} }
    'reservations.create_many': { paramsTuple?: []; params?: {} }
    'reservations.update_many': { paramsTuple?: []; params?: {} }
    'reservations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.index': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.store': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.create_many': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.update_many': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.send_invitation': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'auth.profile': { paramsTuple?: []; params?: {} }
    'employees.index': { paramsTuple?: []; params?: {} }
    'employees.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.index': { paramsTuple?: []; params?: {} }
    'housings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.index': { paramsTuple?: []; params?: {} }
    'reservations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.index': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'auth.profile': { paramsTuple?: []; params?: {} }
    'employees.index': { paramsTuple?: []; params?: {} }
    'employees.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.index': { paramsTuple?: []; params?: {} }
    'housings.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.index': { paramsTuple?: []; params?: {} }
    'reservations.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.index': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'auth.sign_up': { paramsTuple?: []; params?: {} }
    'auth.verify_email': { paramsTuple?: []; params?: {} }
    'auth.sign_in': { paramsTuple?: []; params?: {} }
    'auth.forgot_password': { paramsTuple?: []; params?: {} }
    'auth.reset_password': { paramsTuple?: []; params?: {} }
    'auth.logout': { paramsTuple?: []; params?: {} }
    'auth.delete_account': { paramsTuple?: []; params?: {} }
    'uploads.store': { paramsTuple?: []; params?: {} }
    'employees.store': { paramsTuple?: []; params?: {} }
    'employees.create_many': { paramsTuple?: []; params?: {} }
    'housings.store': { paramsTuple?: []; params?: {} }
    'housings.create_many': { paramsTuple?: []; params?: {} }
    'reservations.store': { paramsTuple?: []; params?: {} }
    'reservations.create_many': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.store': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.create_many': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.send_invitation': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'auth.update_profile': { paramsTuple?: []; params?: {} }
    'employees.update_many': { paramsTuple?: []; params?: {} }
    'employees.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.update_many': { paramsTuple?: []; params?: {} }
    'housings.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.update_many': { paramsTuple?: []; params?: {} }
    'reservations.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.update_many': { paramsTuple?: []; params?: {} }
    'cleaning_reviews.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'employees.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'housings.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'reservations.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'cleaning_reviews.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}