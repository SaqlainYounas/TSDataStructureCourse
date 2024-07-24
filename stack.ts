import LinkedList from "./linked-list";
import {EqualsFunction} from "./utils";

class Stack<T> implements Iterable<T> {
  private list: LinkedList<T>;

  constructor() {
    this.list = new LinkedList();
  }

  /**************************************************************************
                                    NICETIES                                
    **************************************************************************/
  /**
   * Returns size of the Stack O(1)
   * @returns number
   */
  size(): number {
    return this.list.size();
  }

  /**
   * Returns true is stack is Empty O(1)
   * @return boolean
   */
  isEmpty(): boolean {
    return this.list.isEmpty();
  }

  /**
   * Deletes everyting in the stack O(1)
   * @returns {void}
   */
  clear(): void {
    this.list.clear();
  }

  /**
   * Pushes an Element into the stack O(1)
   * @param {T} - value to add to the stack
   * @returns {void}
   */
  push(element: T): void {
    this.list.addBack(element);
  }

  /**
   * Pops the Element from the top of the stack O(1)
   * @returns {T} - removed value from the stack
   */
  pop(): T {
    return this.list.removeBack();
  }

  /**
   * Peeks the tail of the stack O(1)
   * @returns {T} the value of the tail
   */
  peek(): T {
    return this.list.peekBack();
  }

  /**
   * Checks if the first instance of the provided value is found in the stack O(n)
   * Equals function must be supplied for non-primitive values.
   * @param {T} - value to be checked
   * @param {EqualsFunction<T>} equalsFunction - optional
   * @returns boolean
   */
  contains(element: T, equalsFunction?: EqualsFunction<T>): boolean {
    return this.list.contains(
      element,
      equalsFunction ? equalsFunction : undefined,
    );
  }

  [Symbol.iterator](): Iterator<T> {
    return this.list[Symbol.iterator]();
  }
}
