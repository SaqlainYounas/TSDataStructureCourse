import * as utils from "./utils";

/*******************************************************************************
 * An indexed version of the min D-heap. For more information on D-heaps, see
 * ./min-d-heap.ts
 *
 * This version of a heap allows us to add key value pairs. This gives us
 * logarithmic removals and updates, instead of linear.
 *
 * We could add do this in a hacky way by adding a mapping from values to indices.
 * So if we wanted to update or remove a specific value we know the index in the heap
 * in O(1) time.
 *
 * But then using non-primitive complex objects become a hassle. We have to tell
 * the heap class how to access the value. A better solution is to base it off
 * unique keys associated with all the nodes.
 *
 * enqueue(val) - O(log_d(n))
 * dequeue() - O(log_d(n))
 * peek() - O(1)
 * remove(val) - O(log_d(n))! improved from O(n)
 * update(key, val) - O(log_d(n))! improved from O(n)
 * decreaseKey(key, val) - O(log_d(n))! improved from O(n)
 * increaseKey(key, val) - O(log_d(n))! improved from O(n)
 *
 * More info can be found here: https://algs4.cs.princeton.edu/24pq/IndexMinPQ.java.html
 ******************************************************************************/

class MinIndexedDHeap<T> {
  private d: number; // the degree of every node in the heap
  private sz: number; // size of heap

  private values: Array<T | null>; // maps key indices -> values
  public heap: number[]; // maps positions in heap -> key indices
  public pm: number[]; // maps key indices -> positions in heap

  private compare: utils.CompareFunction<T>;

  constructor(degree: number, compareFunction?: utils.CompareFunction<T>) {
    this.d = Math.max(2, degree); // degree must be at least 2
    this.sz = 0;

    this.values = [];
    this.heap = [];
    this.pm = [];

    this.compare = compareFunction || utils.defaultCompare;
  }

  /*****************************************************************************
                                  NICETIES
  *****************************************************************************/
  /**
   * Returns the size of the heap - O(1)
   * @returns {number}
   */
  size(): number {
    return this.sz;
  }
  /**
   * Returns true if the heap is empty, false otherwise - O(1)
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.size() == 0;
  }

  /*****************************************************************************
                                  INSERTION
  *****************************************************************************/
  /**
   * Adds an value with index to the heap, while maintaing heap invariant - O(log_d(n))
   * @param {number} key - index of node
   * @param {T} value - value of node
   * @returns {void}
   */
  add(key: number, value: T): boolean {
    if (this.contains(key)) return false; //we don't want to insert a key which has already been inserted

    this.values[key] = value;

    this.heap.push(key);
    this.sz += 1;

    const keyPosition = this.size() - 1;
    this.pm[key] = keyPosition;

    this.swim(keyPosition);
    return true;
  }

  /*****************************************************************************
                                  ACCESSING
  *****************************************************************************/
  /**
   * Peeks at the top most element in the heap - O(1)
   * @returns {T | null}
   */
  peek(): T | null {
    if (this.isEmpty()) return null;

    const key = this.heap[0];
    const value = this.values[key];

    return value;
  }

  valueOf(key: number): T | null {
    if (!this.contains(key)) return null;

    const value = this.values[key];

    return value;
  }

  /*****************************************************************************
                                  UPDATING
  *****************************************************************************/
  updateKey(key: number, value: T): boolean {
    if (!this.contains(key)) return false;
    if (!this.values[key]) return false;

    this.values[key] = value;
    const position = this.pm[key];

    this.sink(position);
    this.swim(position);
    return true;
  }

  decreaseKey(key: number, newValue: T): boolean {
    if (!this.contains(key)) return false;

    const oldValue = this.values[key];
    if (!oldValue) return false; //if oldvalue is null

    this.values[key] = newValue;

    if (this.lessForValues(newValue, oldValue)) this.values[key] = newValue; //if newValue is less then oldValue

    const position = this.pm[key];

    this.sink(position);
    this.swim(position);
    return true;
  }

  increaseKey(key: number, newValue: T): boolean {
    if (!this.contains(key)) return false;

    const oldValue = this.values[key];
    if (!oldValue) return false; //if oldvalue is null

    this.values[key] = newValue;

    if (this.lessForValues(oldValue, newValue)) this.values[key] = newValue; //if newValue is less then oldValue

    const position = this.pm[key];

    this.sink(position);
    this.swim(position);
    return true;
  }

  /*****************************************************************************
                                  SEARCHING
  *****************************************************************************/
  /**
   * Returns true if key is in heap, false otherwise - O(1)
   * @param {number} key
   * @returns {boolean}
   */
  contains(key: number): boolean {
    return this.pm[key] !== undefined && this.pm[key] !== -1;
  }

  /*****************************************************************************
                                  DELETION
  *****************************************************************************/
  /**
   * Removes and returns top most element of heap - O(log_d(n))
   * @returns {T}
   */
  poll(): T | null {
    if (this.isEmpty()) return null;

    const keyToBeRemoved = this.heap[0];
    const value = this.values[keyToBeRemoved];

    return this.deleteKey(keyToBeRemoved);
  }

  //O(log_d(n))
  deleteKey(key: number): T | null {
    if (!this.contains(key)) return null;

    //save value, so we can return it later & then delete them as well.
    const value = this.values[key];

    if (value === null) throw new Error();

    this.values[key] = null;

    //swap the node with key, key, with last node in the tree

    const removedNodePosition = this.pm[key];
    const lastNodePosition = this.size() - 1;
    this.swap(removedNodePosition, lastNodePosition);
    //then pop of the root, which is the last node in the tree
    this.heap.pop();
    this.sz -= 1;
    //heapify sink/swim
    this.sink(removedNodePosition);
    this.swim(removedNodePosition);
    //remove the position from the pm

    this.pm[key] = -1;

    return value;
  }

  /**
   * Clears the heap - O(1)
   * @returns {void}
   */
  clear(): void {
    this.values.length = 0;
    this.pm.length = 0;
    this.heap.length = 0;
    this.sz = 0;
  }

  /*****************************************************************************
                                  HELPERS
  *****************************************************************************/
  // O(1)
  private getChildrenPositions(parentIndex: number): number[] {
    const indeces: number[] = [];
    for (let i = 1; i <= this.d; i++) {
      indeces.push(parentIndex * this.d + 1);
    }
    return indeces;
  }
  // O(1)
  private getParentPosition(childIndex: number): number {
    return Math.floor((childIndex - 1) / this.d);
  }

  /**
   * Returns true if value of value at positionA is less than value at position B
   * @param {number} positionA
   * @param {number} positionB
   */
  private lessForPositions(positionA: number, positionB: number): boolean {
    const keyA = this.heap[positionA];
    const keyB = this.heap[positionB];

    const valueA = this.values[keyA];
    const valueB = this.values[keyB];

    if (valueA === null || valueB === null)
      throw new Error(utils.VALUE_DOES_NOT_EXIST_ERROR);

    return this.compare(valueA, valueB) < 0;
  }

  /**
   * Returns true if a < b
   * @param {number} a
   * @param {number} b
   * @returns {boolean}
   */
  private lessForValues(a: T, b: T): boolean {
    return this.compare(a, b) < 0;
  }

  /**
   * Sinks element with index k until heap invariant is satisfied - O(dlog(n))
   * O(dlog(n)) because in the worst case we sink the element down the entire
   * height of the tree. At each level, we have to do d comparisons to find
   * smallest child to swim down.
   * @param {number} k
   * @returns {void}
   */
  private sink(k: number): void {
    while (true) {
      const childrenPositions = this.getChildrenPositions(k);

      let smallestChildPosition = childrenPositions[0];

      for (const childPosition of childrenPositions) {
        const childPositionIsInBounds = smallestChildPosition < this.size();
        const currentChildIsSmallerThanMin = this.lessForPositions(
          childPosition,
          smallestChildPosition,
        );
        if (childPositionIsInBounds && currentChildIsSmallerThanMin) {
          smallestChildPosition = childPosition;
        }
      }

      const childrenPositionsIsOutOfBounds =
        smallestChildPosition >= this.size();
      const elementIsLessThanChild = this.lessForPositions(
        k,
        smallestChildPosition,
      );
      if (childrenPositionsIsOutOfBounds || elementIsLessThanChild) break;

      this.swap(k, smallestChildPosition);
      k = smallestChildPosition;
    }
  }

  /**
   * Swims an element with index k until heap invariant is satisfied - O(log_d(n))
   * O(logd(n)) because in the worst case we swim the element up the entire tree
   * @param {number} k
   * @returns {void}
   */
  private swim(k: number): void {
    let parentPostion = this.getParentPosition(k);

    while (k > 0 && this.lessForPositions(k, parentPostion)) {
      this.swap(k, parentPostion);
      k = parentPostion;
      parentPostion = this.getParentPosition(k);
    }
  }
  // O(1)
  private swap(positionI: number, positionJ: number): void {
    let keyI = this.heap[positionI];
    let keyJ = this.heap[positionJ];

    this.pm[keyI] = positionJ;
    this.pm[keyJ] = positionI;

    this.heap[positionI] = keyJ;
    this.heap[positionJ] = keyI;
  }
}

export default MinIndexedDHeap;
