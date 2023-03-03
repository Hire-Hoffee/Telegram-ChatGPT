const database = {
  DB: [],
  filterDB: function (id) {
    this.DB = this.DB.filter((item) => {
      return item.from.id !== id;
    });
  },
};
export { database };
