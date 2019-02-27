export interface Styles {
  [key:string]: string
}


export const StylesValidator = {
  /**
   * Check if the object in the parameters complies to the Styles interface.
   * @param {object} styles 
   * @returns {boolean}
   */
  validate(styles: Styles): boolean {
    if (typeof(styles) === 'object') {
      for (const key in styles) {
        if (typeof(styles[key]) !== 'string') {
          return false
        }
      }
    }
    else {
      return false
    }
    return true
  }
}
