const {nanoid} = require('nanoid');
const books = require('./xbooks');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  const isBookNameExists = request.payload.name !== undefined;

  const isReadPageLessThanPageCount =
    request.payload.readPage <= request.payload.pageCount;

  const isSuccess = isBookNameExists && isReadPageLessThanPageCount;

  if (isSuccess) {
    books.push(newBook);

    const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        }).code(201);

    return response;
  }

  if (!isBookNameExists) {
    const response = h
        .response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        }).code(400);

    return response;
  }

  if (!isReadPageLessThanPageCount) {
    const response = h
        .response({
          status: 'fail',
          message:
            'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);

    return response;
  }

  const response = h
      .response({
        status: 'error',
        message: 'Catatan gagal ditambahkan',
      }).code(500);

  return response;
};

const getAllBooksHandler = (request, h) => {
  const {reading, finished, name} = request.query;

  let readingToInt;
  let finishedToInt;

  try {
    if (reading) {
      readingToInt = parseInt(reading, 10);
    }
    if (finished) {
      finishedToInt = parseInt(finished, 10);
    }
  } catch (error) {
    //
  }

  if (readingToInt !== undefined) {
    const response = h
        .response({
          status: 'success',
          data: {
            books: books
                .filter((b) => b.reading === Boolean(readingToInt))
                .map((book) => ({
                  id: book.id,
                  name: book.name,
                  publisher: book.publisher,
                })),
          },
        }).code(200);

    return response;
  }

  if (finishedToInt !== undefined) {
    const response = h
        .response({
          status: 'success',
          data: {
            books: books
                .filter((b) => b.finished === Boolean(finishedToInt))
                .map((book) => ({
                  id: book.id,
                  name: book.name,
                  publisher: book.publisher,
                })),
          },
        }).code(200);

    return response;
  }

  if (name) {
    const response = h
        .response({
          status: 'success',
          data: {
            books: books
                .map((book) => ({
                  id: book.id,
                  name: book.name,
                  publisher: book.publisher,
                }))
                .filter((b) => b.name
                    .toLowerCase()
                    .includes(name.toLowerCase())),
          },
        }).code(200);

    return response;
  }

  const response = h
      .response({
        status: 'success',
        data: {
          books: books.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      }).code(200);

  return response;
};

const getBookByIdHandler = (request, h) => {
  const {id} = request.params;

  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h
      .response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      }).code(404);

  return response;
};

const editBookByIdHandler = (request, h) => {
  const {id} = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === id);

  const isIndexFound = index !== -1;

  const isBookNameExists = request.payload.name !== undefined;

  const isReadPageLessThanPageCount =
        request.payload.readPage <= request.payload.pageCount;

  const isSuccess =
        isBookNameExists && isReadPageLessThanPageCount && isIndexFound;

  if (isSuccess) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        }).code(200);

    return response;
  }

  if (!isBookNameExists) {
    const response = h
        .response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        }).code(400);

    return response;
  }

  if (!isReadPageLessThanPageCount) {
    const response = h
        .response({
          status: 'fail',
          message:
            'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        }).code(400);

    return response;
  }

  if (!isIndexFound) {
    const response = h
        .response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Id tidak ditemukan',
        }).code(404);

    return response;
  }

  const response = h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui catatan. Id tidak ditemukan',
      }).code(404);

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const {id} = request.params;
  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);

    const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        }).code(200);

    return response;
  }

  const response = h
      .response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      }).code(404);

  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
