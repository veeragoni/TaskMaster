import os
from flask import Flask, render_template, request, jsonify
from flask_migrate import Migrate
from models import db, Todo, CategoryEnum
import logging
from sqlalchemy import text, create_engine
from sqlalchemy.exc import SQLAlchemyError

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
db.init_app(app)
migrate = Migrate(app, db)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify([category.value for category in CategoryEnum])

@app.route('/api/todos', methods=['GET'])
def get_todos():
    try:
        todos = db.session.execute(db.select(Todo).order_by(Todo.id)).scalars().all()
        todo_list = [{
            'id': todo.id,
            'task': todo.task,
            'completed': todo.completed,
            'category': todo.category.value if todo.category else 'No Category'
        } for todo in todos]
        logger.info(f'Fetched todos: {todo_list}')
        return jsonify(todo_list)
    except Exception as e:
        logger.error(f'Error fetching todos: {str(e)}', exc_info=True)
        return jsonify([]), 200  # Return an empty list with a 200 status code

@app.route("/api/todos", methods=["POST"])
def add_todo():
    try:
        data = request.json
        logger.info(f"Received data for new todo: {data}")
        category = CategoryEnum[data['category'].upper()]
        logger.info(f"Converted category: {category}")
        new_todo = Todo(task=data['task'], category=category)
        db.session.add(new_todo)
        db.session.commit()
        logger.info(f"New todo added: {new_todo.id}, {new_todo.task}, {new_todo.category}")
        return jsonify({
            "id": new_todo.id,
            "task": new_todo.task,
            "completed": new_todo.completed,
            "category": new_todo.category.value
        }), 201
    except KeyError as ke:
        db.session.rollback()
        logger.error(f"KeyError in add_todo: {str(ke)}", exc_info=True)
        return jsonify({"error": f"Missing or invalid key: {str(ke)}"}), 400
    except ValueError as ve:
        db.session.rollback()
        logger.error(f"ValueError in add_todo: {str(ve)}", exc_info=True)
        return jsonify({"error": f"Invalid category value: {data.get('category', 'Not provided')}"}), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding todo: {str(e)}", exc_info=True)
        return jsonify({"error": "An error occurred while adding the todo"}), 500

@app.route("/api/todos/<int:todo_id>", methods=["PUT"])
def update_todo(todo_id):
    try:
        todo = db.get_or_404(Todo, todo_id)
        data = request.json
        logger.info(f"Updating todo {todo_id} with data: {data}")
        if 'task' in data:
            todo.task = data['task']
        if 'completed' in data:
            todo.completed = data['completed']
        if 'category' in data:
            todo.category = CategoryEnum[data['category'].upper()]
        db.session.commit()
        logger.info(f"Todo updated: {todo.id}, {todo.task}, {todo.completed}, {todo.category}")
        return jsonify({
            "id": todo.id,
            "task": todo.task,
            "completed": todo.completed,
            "category": todo.category.value
        })
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating todo: {str(e)}", exc_info=True)
        return jsonify({"error": "An error occurred while updating the todo"}), 500

@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    try:
        todo = db.get_or_404(Todo, todo_id)
        logger.info(f"Deleting todo: {todo.id}, {todo.task}")
        db.session.delete(todo)
        db.session.commit()
        return "", 204
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting todo: {str(e)}", exc_info=True)
        return jsonify({"error": "An error occurred while deleting the todo"}), 500

if __name__ == "__main__":
    db_url = app.config["SQLALCHEMY_DATABASE_URI"]
    logger.info(f"Database URL: {db_url.split('@')[0]}@[REDACTED]")

    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}", exc_info=True)

    app.run(host="0.0.0.0", port=5000)

# Set the FLASK_APP environment variable
os.environ['FLASK_APP'] = 'main.py'
