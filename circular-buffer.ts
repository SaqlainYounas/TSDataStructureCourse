import * as utils from "./utils";

class CircularBuffer<T> {
  private list: T[];
  private sz: number;
  private capacity: number;

  private readIndex: number;
  private writeIndex: number;

  private equalsF: utils.EqualsFunction<T>;

  constructor(capacity: number, equalsFunction?: utils.EqualsFunction<T>) {
    this.capacity = capacity;
    this.list = new Array(capacity);
    this.sz = 0;
    this.readIndex = 0;
    this.writeIndex = 0;
    this.equalsF = equalsFunction || utils.defaultEquals; //If the Equals function is provided we use that OR we use the default Equal Function.
  }

  /**************************************************************************
                                    NICETIES                                
    **************************************************************************/
  /**
   * Returns the size of the circular buffer - O(1)
   */
  size(): number {
    return this.sz;
  }

  /**
   * Returns true if the circular buffer is empty - false otherwise O(1)
   * @returns {boolean}
   */
  isEmpty(): boolean {
    return this.size() === 0;
  }

  /**
   * Deletes all elements in the buffer and just creates a new one with the capacity provided - O(capacity)
   * @returns {void}
   */
  clear(): void {
    this.list = new Array(this.capacity);
    this.sz = 0;
  }

  /*****************************************************************************
                                  INSERTION/DELETION
  *****************************************************************************/
  /**
   * Enqueues element into queue - O(1)
   * @param {T} element - element to be enqueued
   */
  enqueue(element: T): void {
    //we will add the element in the current write Index
    this.list[this.writeIndex] = element;

    //if read and write index are in the same position, then we set it to true.
    const elementIsOverWritten =
      this.sz !== 0 && this.readIndex === this.writeIndex;

    //elementIsOverwritten is true (which means read and write are on the same index, we will incrment read index)
    if (elementIsOverWritten) {
      this.readIndex = (this.readIndex + 1) % this.capacity;
    }

    //finally we will increment the write index
    this.writeIndex = (this.writeIndex + 1) % this.capacity;

    this.sz += 1;
  }

  /**
   * Dequeues element from queue - O(1)
   * @returns {T}
   */
  dequeue(): T | null {
    if (this.isEmpty()) return null; //return Null if the List is empty.

    const removedVal = this.list[this.readIndex]; //Get the value to remove

    this.readIndex = (this.readIndex - 1) % this.capacity; // increment read index

    this.sz -= 1; // Decrease the size

    return removedVal; // Return the remove val.
  }

  /*****************************************************************************
                                  ACCESSING
  *****************************************************************************/
  /**
   * Peeks at the element at the front of the queue - O(1)
   * @returns {T} - frontmost element
   * @throws Empty List error
   */
  peekFront(): T | null {
    if (this.isEmpty()) return null; //return null if the List is empty
    return this.list[this.readIndex];
  }

  /**
   * Peeks at the element at the back of the queue - O(1)
   * @returns {T} - Backmost element
   */
  peekBack(): T | null {
    if (this.isEmpty()) return null; //return null if the List is empty

    let i = this.writeIndex - 1; //Since The last element we wrote is one index behind the Write, so we get its value.
    if (i < 0) i = this.capacity - 1; // if i is at 0 index then we go around and set the i to the last element of the buffer

    return this.list[i];
  }

  /*****************************************************************************
                                  CONTAINS 
  *****************************************************************************/
  /**
   * Checks if value is in buffer - O(n)
   * @param {T} element  - element to search for
   * @returns {boolean}
   */
  contains(element: T): boolean {
    // we run the 'some' function on the array and pass it a equelsF function which will compare each of the value of the List with the provided Element.
    return this.list.some((val: T) => {
      return this.equalsF(val, element);
    });
  }
}

export default CircularBuffer;
