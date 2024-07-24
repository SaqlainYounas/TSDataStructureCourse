import * as utils from "./utils";

interface List<T> {
  head: LinkedListNode<T>;
  tail: LinkedListNode<T>;
  size: number;
}

class LinkedList<T> implements Iterable<T> {
  private list: List<T> | undefined;
  private equalsF: utils.EqualsFunction<T> = utils.defaultEquals;
  constructor(equalsFunction?: utils.EqualsFunction<T>) {
    this.list = undefined;
    if (equalsFunction) this.equalsF = equalsFunction;
  }

  /**
   * Returns size - 0(1)
   * @return {number}
   */
  size(): number {
    if (this.list) return this.list.size;

    return 0;
  }

  /**
   * Returns true if linked list is empty, false otherwise - O(1)
   * @returns boolean
   */
  isEmpty(): boolean {
    return !this.list;
  }

  /**
   * Adds a new Node to the head of the Linked List - O(1)
   * @param {T} - value to add to List
   * @return {void}
   */
  addFront(val: T): void {
    const newNode = new LinkedListNode(val);

    if (this.list) {
      //if we have a list
      this.list.head.prev = newNode;
      newNode.next = this.list.head;

      this.list.head = newNode;
      this.list.size += 1;
    } else {
      //if we don't have a list
      this.list = {
        head: newNode,
        tail: newNode,
        size: 1,
      };
    }
  }

  /**
   * Adds node to the tail of the linked list - O(1)
   * @param {T} - value to add to list
   * @return {void}
   */
  addBack(val: T): void {
    const newNode = new LinkedListNode(val);

    if (this.list) {
      this.list.tail.next = newNode;
      newNode.prev = this.list.tail;

      this.list.tail = newNode;
      this.list.size += 1;
    } else {
      this.list = {
        head: newNode,
        tail: newNode,
        size: 1,
      };
    }
  }

  /**
   * Adds a node at specified index - O(n)
   * @param {number} i - index
   * @param {T} val - value to add to the list
   * @return {void}
   */
  addAt(i: number, val: T): void {
    if (i == 0) {
      //this means we add to head
      this.addFront(val);
      return;
    }

    if (i === this.size()) {
      this.addBack(val);
      return;
    }

    if (i < 0 || i >= this.size() || !this.list) {
      //if index is not less then 0
      //if index is not greater or equal to the total size of the linked list
      //if we don't have a list
      throw new Error("OUT OF BOUND ERROR");
    }

    let curr = this.list.head;
    for (let j = 0; j < i - 1; i++) {
      //this loop will take us to the node which is one before the 'i' since we have a condition i-1
      curr = curr.next!;
    }

    //create a new node with value
    const newNode = new LinkedListNode(val);

    //curr is one before the desired index. so we set its next node's prev to our new node
    curr.next!.prev = newNode;
    //and set the newNodes next to curr's next
    newNode.next = curr.next;

    //we set the newNodes prev to the curr - becuase its one before the desired insertion index
    newNode.prev = curr;
    //we set curr next to our newNode
    curr.next = newNode;
    this.list.size += 1;
  }

  /**
   * Gets the value of head - O(1)
   * @returns {T} value of head
   */
  peekFront(): T {
    if (!this.list) throw new Error("List is Empty, Can't Peek!");

    return this.list.head.val;
  }

  /**
   * Gets the value of Tail - O(1)
   * @returns {T} value of Tail
   */
  peekBack(): T {
    if (!this.list) throw new Error("List is Empty, Can't Peek!");

    return this.list.tail.val;
  }

  /**
   * Gets the element at the index i - O(n)
   * @param {number} i - index of the element
   * @returns {T} value of element at index i
   */
  get(i: number): T {
    if (i < 0 || i >= this.size() || !this.list) {
      //if index is not less then 0
      //if index is not greater or equal to the total size of the linked list
      //if we don't have a list
      throw new Error("OUT OF BOUND ERROR");
    }

    // we start at 0 index
    let j = 0;
    // we start at the head
    let curr = this.list.head;

    //while j < i (where we want to get the value from )
    while (j < i) {
      //we go ahead if we are not at the desired index
      curr = curr.next!;
      j++;
    }
    //while will exit if we are at out desired curr & we return its value
    return curr.val;
  }

  /**
   * Takes a value and potential optional equal function and returns the index of the node that has the value of T if it is found - O(n)
   * @param {T} value - value to search for
   * @param {function(T,T):boolean =} equalsFunction - optional - function to check if two items are equal
   * @return {number} the index of the first occurence of the element, and -1 if the element doesn't exist
   */
  indexOf(value: T, equalsFunction?: utils.EqualsFunction<T>): number {
    if (!this.list) return -1; //Linked List is not defined so we return -1 automatically.

    const equalsF = equalsFunction || utils.defaultEquals;

    let i = 0;
    let cur = this.list.head;

    //while current value is not equal to the provided value
    while (!equalsF(cur.val, value)) {
      cur = cur.next!;
      i += 1;
    }

    //while will exit when the current the cur.val === value. we will have the correct i value.
    return i;
  }

  /**
   * Check if the value is in the linked list O(n)
   * Equals function must be supplied for non-primitive values.
   * @param {T} value - value to search for
   * @param {EqualsFunction<T>} equalsFunction - optional
   * function to check if two items are equal
   * @return {boolean}
   */
  contains(value: T, equalsFunction?: utils.EqualsFunction<T>): boolean {
    //first we get the index of the provided value in the linked list
    const index = this.indexOf(
      value,
      equalsFunction ? equalsFunction : undefined,
    );

    //if the index does not equal negative -1 then we return true. that means we have an index.
    return index !== -1;
  }

  /*****************************DELETION ***************************************/
  /**
   * Removes head - O(1) and returns it
   * @return
   */
  removeFront(): T {
    if (!this.list) throw new Error("Empty Error");

    const val = this.list.head.val;
    if (this.list.head.next) {
      //if there is a next element in the head
      this.list.head.next.prev = null; // we set the forward node's prev to null
      this.list.head = this.list.head.next; // we set head of the list to the one next to current head
      this.list.size = -1;
    } else {
      //if there isn't a next element in the head.
      this.list = undefined;
    }

    return val;
  }

  /**
   * Removes tail - O(1) and returns it
   * @return
   */
  removeBack(): T {
    if (!this.list) throw new Error("Empty Error");

    const val = this.list.tail.val;
    if (this.list.tail.prev) {
      //if there is an node before the tail node
      this.list.tail.prev.next = null; // we set the next value of the node previous then the tail to null
      this.list.tail = this.list.tail.prev;
      this.list.size = -1;
    } else {
      //if there isn't a node before the tail.
      this.list = undefined;
    }

    return val;
  }

  /**
   * Remove first occurence of the node with specified value. Return true if removal was successful, and false otherwise - O(n)
   * @param {T} val - value to remove
   * @returns {T} - value of removed node
   */
  remove(val: T): T {
    const index = this.indexOf(val);

    if (index === -1) throw new Error("Value doesn't exist");

    return this.removeAt(index);
  }

  /**
   * Removes node at specified index - O(n)
   * @param {number} i - index to remove
   * @return {T} - value of removed node
   */
  removeAt(i: number): T {
    if (i === 0) {
      return this.removeFront();
    }

    if (i == this.size() - 1) {
      return this.removeBack();
    }

    if (i < 0 || i >= this.size() || !this.list) {
      //if index is not less then 0
      //if index is not greater or equal to the total size of the linked list
      //if we don't have a list
      throw new Error("OUT OF BOUND ERROR");
    }

    let j = 0;
    let curr = this.list.head;

    //we will traverse on the list untill we land on the node we want to delete
    while (j < i) {
      curr = curr.next!;
      j++;
    }

    //set the next Prev of the next node to the previous node of current
    curr.next!.prev = curr.prev;
    //set the next of the previous node to the next node of current
    curr.prev!.next = curr.next;
    this.list.size = -1;

    return curr.val;
  }

  /**
   * Deletes all nodes = O(1)
   */
  clear(): void {
    this.list = undefined;
  }

  /*******************************HELPERS****************************************/
  fromArray(A: T[]): LinkedList<T> {
    for (const a of A) {
      this.addBack(a);
    }

    return this;
  }

  *[Symbol.iterator](): Iterator<T> {
    if (!this.list) return;

    let curr: LinkedListNode<T> | null;

    for (curr = this.list.head; curr != null; curr = curr.next) {
      yield curr?.val;
    }
  }
}

export default LinkedList;
