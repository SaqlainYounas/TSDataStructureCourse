import * as utils from "./utils";

/*******************************************************************************
 * A min binary heap implements the Priority Queue ADT. It has constant access
 * to the min element of the heap, with logarithmic insertions and deletions.
 *
 * add(element) - O(logn)
 * poll() - O(logn) // remove
 * peek() - O(1)
 *
 * For more info, refer to https://en.wikipedia.org/wiki/Binary_heap
 ******************************************************************************/

class MinBinaryHeap<T> {
  // a dynamic array to hold our elements
  private heap: T[];
  private compare: utils.CompareFunction<T>;

  constructor(
    elements?: Iterable<T>,
    compareFunction?: utils.CompareFunction<T>,
  ) {
    this.heap = [];
    this.compare = compareFunction || utils.defaultCompare;
    if (elements) {
      this.heap = Array.from(elements);
      this.heapify(); //O(n)
    }
  }

  // Even though we are looping through n/2 elements and calling sink which is O(logn),
  // this method is still bounded by O(n), not O(nlogn). The reason being is because
  // we start at the second last row of the tree. Not sinking the last row of the tree
  // already removes half the work.

  // See more info on Floyd's heap construction here: https://en.wikipedia.org/wiki/Heapsort#Variations
  private heapify(): void {
    let i = Math.max(0, Math.floor(this.size() / 2) - 1);
    for (; i >= 0; i--) {
      this.sink(i);
    }
  }

  /*****************************************************************************
                                  INSPECTION
  *****************************************************************************/
  /**
   * Returns the size of the heap - O(1)
   * @returns {number}
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Returns true if the heap is empty, false otherwise - O(1)
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.size() == 0;
  }

  /*****************************************************************************
                                  INSERTION/DELETION
  *****************************************************************************/
  /**
   * Adds an element to the heap, while maintaing the heap invariant - O(log(n))
   * @param {T} element
   * @returns {void}
   */
  add(element: T): void {
    this.heap.push(element);
    const index = this.size() - 1;
    this.swim(index);
  }

  /**
   * Removes and returns top most element of heap - O(log(n))
   * @returns {T}
   */
  poll(): T | null {
    if (this.isEmpty()) return null;

    return this.removeAt(0);
  }

  /**
   * Removes element if it exists. Returns true if success, false otherwise - O(n)
   * @param {T} element
   * @returns {boolean}
   */
  remove(element: T): boolean {
    const elementIndex = this.heap.findIndex(
      (h: T) => this.compare(h, element) === 0,
    );

    if (elementIndex === -1) return false;

    this.removeAt(elementIndex);

    return true;
  }

  /**
   * Clears the heap - O(1)
   * @returns {void}
   */
  clear(): void {}

  /*****************************************************************************
                                  ACCESSING
  *****************************************************************************/
  /**
   * Peeks at the top most element in the heap - O(1)
   * @returns {T}
   */
  peek(): T | null {
    if (this.isEmpty()) return null;

    return this.heap[0]; // the head of our tree
  }

  /*****************************************************************************
                                  SEARCHING
  *****************************************************************************/
  /**
   * Returns true if element is in heap, false otherwise - O(n)
   * @param {T} element
   * @returns {boolean}
   */
  contains(element: T): boolean {
    return this.heap.includes(element);
  }

  /*****************************************************************************
                                  HELPERS
  *****************************************************************************/
  /**
   * Sinks element with index k until heap invariant is satisfied - O(log(n))
   * O(log(n)) because in the worst case we sink the element down the entire
   * height of the tree
   * @param {number} k
   * @returns {void}
   */
  private sink(k: number): void {
    while (true) {
      //1. get the smallest child index
      const leftChildIndex = this.getLeftChildIndex(k);
      const rightChildIndex = this.getRightChildIndex(k);

      let smallestChildIndex = leftChildIndex; //we gonna assume smallest is left.
      const isRightChildSmallerThanLeft =
        rightChildIndex < this.size() &&
        this.less(rightChildIndex, leftChildIndex);
      if (isRightChildSmallerThanLeft) smallestChildIndex = rightChildIndex;

      //2. Make sure smallest child index is not out of bounds.
      const childrenAreOutOfBounds = leftChildIndex >= this.size();
      const elementIsLessThanChildren = this.less(k, smallestChildIndex);
      if (childrenAreOutOfBounds || elementIsLessThanChildren) break;

      //3. if it is not, then swap the current node with the child
      this.swap(k, smallestChildIndex);
      k = smallestChildIndex;
    }
  }

  /**
   * Swims an element with index k until heap invariant is satisfied - O(log(n))
   * O(log(n)) because in the worst case we swim the element up the entire tree
   * @param {number} k
   * @returns {void}
   */
  private swim(k: number): void {
    let parentIndex = this.getParentIndex(k);

    while (k > 0 && this.less(k, parentIndex)) {
      this.swap(k, parentIndex);
      k = parentIndex;

      parentIndex = this.getParentIndex(k);
    }
  }

  // O(1)
  private swap(i: number, j: number): void {
    const temp = this.heap[i];

    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Removes element at provided index by swapping it with last element, and
   * heapifying the swapped element by sinking/swimming it - O(log(n)).
   *
   * O(log(n)) because in worst case we swink/swim element throughout the entire tree
   * @param {number} indexToRemove
   * @returns {T}
   */
  private removeAt(indexToRemove: number): T {
    //1. grab the element at the specified index and save it for later so we can return
    const removedValue = this.heap[indexToRemove];

    //2. swap element with the last element in our heap
    const indexOfLastElement = this.size() - 1;
    this.swap(indexToRemove, indexOfLastElement);
    this.heap.pop();

    //3. if the element we're removing is the last element in the heap, return that now
    const isLastElementBeingRemoved = indexToRemove === indexOfLastElement;
    if (isLastElementBeingRemoved) return removedValue;

    //4. heapify
    //first we will try to sink for heapification
    const indexToBeHeapified = indexToRemove;
    const elementToBeHeapified = this.heap[indexToBeHeapified];
    this.sink(indexToBeHeapified);
    //if that didn't work then we will try to swim
    const elementDidNotMove =
      this.heap[indexToBeHeapified] === elementToBeHeapified;
    if (elementDidNotMove) {
      this.swim(indexToBeHeapified);
    }
    //5. return the saved value of the removed value
    return removedValue;
  }

  // O(1)
  private getLeftChildIndex(parentIndex: number): number {
    return parentIndex * 2 - 1;
  }
  // O(1)
  private getRightChildIndex(parentIndex: number): number {
    return parentIndex * 2 + 2;
  }
  // O(1)
  private getParentIndex(childIndex: number): number {
    return Math.floor((childIndex - 1) / 2);
  }

  /**
   * Returns true if a is less than b, false otherwise
   * @param {number} a
   * @param {number} b
   */
  private less(a: number, b: number) {
    return this.compare(this.heap[a], this.heap[b]) < 0;
  }
}
