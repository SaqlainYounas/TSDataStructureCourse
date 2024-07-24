import LinkedList from "./linked-list";
import {EqualsFunction} from "./utils";
class Queue<T> implements Iterable<T> {
  private list: LinkedList<T>;

  constructor(equalsFunction?: EqualsFunction<T>) {
    if (equalsFunction) {
      this.list = new LinkedList(equalsFunction);
    } else {
      this.list = new LinkedList();
    }
  }

  /**************************************************************************
                                    NICETIES                                
    **************************************************************************/

  /**
   * Returns the size of the Queue - O(1)
   */
  size(): number {
    return this.list.size();
  }

  /**
   * Returns ture if the queue is empty - false otherwise O(1)
   */
  isEmpty(): boolean {
    return this.list.isEmpty();
  }

  /**
   * Deletes everything in the queue - O(1)
   */
  clear(): void {
    this.list.clear();
  }

  /*****************************************************************************
                                  INSERTION/DELETION
  *****************************************************************************/

  /**
   * Enqueues element to the back of the queue - O(1)
   * @param {T} element - element to be enqueued
   */
  enqueue(element: T): void {
    this.list.addBack(element);
  }

  /**
   * Dequeues element to the front of the queue - O(1)
   * @param {T} element - element to be dequeued
   * @throws Empty List Error
   */
  dequeue(): T {
    return this.list.removeFront();
  }

  /*****************************************************************************
                                  ACCESSING
  *****************************************************************************/
  /**
   * Peeks at the element at the front of the queue - O(1)
   * @returns {T} - frontmost element
   * @throws Empty List error
   */
  peekFront(): T {
    return this.list.peekFront();
  }

  /**
   * Peeks at the element at the back of the queue - O(1)
   * @returns {T} - Backmost element
   */
  peekBack(): T | null {
    if (this.isEmpty()) return null;
    return this.list.peekFront();
  }

  /*****************************************************************************
                                  SEARCHING
  *****************************************************************************/
  /**
   * Checks if value is in queue - O(n)
   * @param {T} element  - element to search for
   * @returns {boolean}
   */
  contains(element: T): boolean {
    return this.list.contains(element);
  }

  /*****************************************************************************
                                  HELPERS
  *****************************************************************************/
  [Symbol.iterator](): Iterator<T> {
    return this.list[Symbol.iterator]();
  }
}
