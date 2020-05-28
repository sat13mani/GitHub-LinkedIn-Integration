import sqlite3
from sqlite3 import Error



def create_connection(path):
    connection = None
    try:
        connection = sqlite3.connect(path)
        print("connection established")
    except Error as error:
        print(f"The error '{error}' occurred")
    
    return connection


def execute_query(connection, query):
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
        print("Query executed successfully")
    except Error as error:
        print(f"The error '{error}' occurred")


def execute_read_query(connection, query, no_of_records=None):
    cursor = connection.cursor()
    result = None
    try:
        cursor.execute(query)
        if no_of_records == 1:
            result = cursor.fetchone()
        else:
            result = cursor.fetchall()
        return result
    except Error as error:
        print(f"The error '{error}' occurred")



if __name__ == "__main__":
    conn = create_connection('test.db')
    values = ('ujjwal-raizada', 'password', 0)
    query = f"INSERT INTO User (username, password, hasLinked) VALUES {values}"
    execute_query(conn, query)
