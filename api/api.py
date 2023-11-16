from flask import Flask, redirect, url_for, make_response, json, jsonify, request, render_template, session
# from flask_session import Session
# for react calling
from flask_cors import CORS, cross_origin
# for sending mail
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
from bson import DBRef
# hash pass generator
from flask_bcrypt import Bcrypt
# for dumping value in resposne
from bson.json_util import dumps
import json
# for returning objectID
from bson.objectid import ObjectId
# for wraping
from functools import wraps
# for token
import jwt
# token expired time
import datetime
# generate random number
from random import randint
import pandas as pd
import os
from werkzeug.utils import secure_filename
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
#from flask_email_verifier import EmailVerifier
# from flask_email_verifier import Client
# from flask_email_verifier import exceptions
UPLOAD_FOLDER = os.getcwd()
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])


# initialize the app
app = Flask(__name__)

# random secrect key initialization
app.secret_key = "thisisthesecretkey"
# db config
app.config['MONGO_URI'] = "mongodb://localhost:27017/userReg"
# app.config['MONGO_URI'] = "mongodb://root:iritadb2021@127.0.0.1:27020/userReg?authSource=admin"
# app.config['MONGO_URI'] = "mongodb://admin:iritadb2021@localhost:27020/userReg?authSource=admin"
# configuration for flask-mail
app.config["MAIL_SERVER"] = 'mail.iritatech.com'
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = 'admin@iritatech.com'
app.config['MAIL_PASSWORD'] = 'X5Y[qN!GM3Yu'

app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# SESSION_TYPE = 'filesystem'
# app.config.from_object(__name__)
# Session(app)
CORS(app, supports_credentials=True)
mail = Mail(app)
#verifier = EmailVerifier(app)
# EMAIL_VERIFIER_KEY = 'at_4WGDL75Kbnd4H7dLhDHOKZU6E0xY5'

# connects to the mongoDB server
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
safeSerializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
# -----------login Start-------------


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = ''
        # print(request.headers)
        # token = request.headers['X-Auth-Token']
        # print(token)
        if 'Authorization' in request.headers:
            token = request.headers['Authorization']
            ExBr = token.split(" ")
            print("Token Testing: "+ExBr[1])
            token = ExBr[1]
        if not token:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'A valid token is missing', 'status': 404, }
            }
            return jsonify(message)
        try:
            data = jwt.decode(
                token, app.config['SECRET_KEY'], algorithms=["HS256"])
            print(data)
            session['user'] = data['user']
        except:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Token is invalid', 'status': 404, }
            }
            return jsonify(message)
        return f(*args, **kwargs)
    return decorator


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    return app.send_static_file('index.html')

# for unprotected users and dont have any token


@app.route('/unprotected')
def unprotected():
    return jsonify({'message': 'Anyone can view this'})


# for valid users with token


@app.route('/protected')
@token_required
def protected():
    print('hello')
    return jsonify({'message': 'Available with valid tokens'})

# Email Verification


# @app.route('/email_test', methods=['POST'])
# @cross_origin(supports_credentials=True)
# def email_test():
#     _json = request.json
#     print(_json)
#     # _name = _json['name']
#     _email = _json['email']
#     # Retrieve an info for the given email address
#     email_address_info = verifier.verify(_email)
#     print(email_address_info)
#     if email_address_info is not None:
#         data = dumps(loads(email_address_info.json_string), indent=4)
#         resp = make_response(data, 200)
#         resp.headers['Content-Type'] = 'application/json'
#     else:
#         resp = 'Not found'
#     return resp


@app.route('/login', methods=['GET', 'POST'])
@cross_origin(supports_credentials=True)
def login():
    _json = request.json
    print(_json)
    # _name = _json['name']
    _email = _json['email']
    _password = _json['password']
    # if email & name is matched
    response = mongo.db.userReg.find_one({'email': _email})
    if response:
        if response['emailconfirm']:
            if bcrypt.check_password_hash(response['password'], _password):
                # generating token and set token time 60 minutes
                token = jwt.encode({'user': response['email'], 'exp': datetime.datetime.utcnow(
                ) + datetime.timedelta(minutes=1060)}, app.config['SECRET_KEY'])
                # usermail

                # returning the token
                message = {
                    'data': {'token': token},
                    'result': {'isError': 'false', 'message': 'Login Successful', 'status': 200, }
                }
                return jsonify(message)
        else:
            message = {
                'data': 'null',
                'result': {'isError': 'true', 'message': 'User Account is not activated', 'status': 401, }
            }
            return jsonify(message)
    message = {
        'data': 'null', 'result': {'isError': 'true', 'message': 'Username or password is invalid', 'status': 401, }
    }
    return jsonify(message)
    # return make_response(jsonify(message), 401, {'WWW-Authenticate': 'Basic realm="Login Required" '})

# OTP varify and generate token


@app.route('/otp_verify', methods=['POST'])
def otp_verify():
    _json = request.get_json()
    _user_email = _json['email']
    _user_otp = _json['otp']
    f = 0
    for post in mongo.db.userOtp.find():
        if post['email'] == _user_email and post['otp'] == _user_otp:
            mongo.db.userOtp.delete_one(post)
            f = 1
            break
    if(f == 1):
        response = {'email': _user_email}
        # generating token and set token time 60 minutes
        token = jwt.encode({'user': response['email'], 'exp': datetime.datetime.utcnow(
        ) + datetime.timedelta(minutes=60)}, app.config['SECRET_KEY'])
        # usermail
        session['user'] = _user_email

        # returning the token
        message = {
            'data': {'token': token.decode('UTF-8')},
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    else:
        message = {
            'data': "null",
            'result': {'isError': 'true', 'message': 'Invalid', 'status': 404, }
        }
        return jsonify(message)
# -----------login End---------------
# -----------Registration Start------
# adding user


@app.route('/add', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_user():
    # convert json
    # _json = request.get_json()
    try:
        _json = request.form
        _firstname = _json['firstname']
        _middlename = _json['middlename']
        _lastname = _json['lastname']
        _name = _firstname + ' ' + _middlename + ' ' + _lastname
        print(_name)
        _user_category = _json['user_category']
        _student_type = _json['student_type']
        _job_type = _json['job_type']
        _specialization_type = _json['specialization_type']
        _email = _json['email']
        _phone = _json['phone']
        _address = _json['address']
        _country = _json['country']
        _image = _json['image']
        _referrer_name = _json['referrer_name']
        _referrer_email = _json['referrer_email']
        _emailconfirm = False
        print(_emailconfirm)
        _password = bcrypt.generate_password_hash(
            _json['password']).decode('utf-8')
        _passwordconfirm = bcrypt.generate_password_hash(
            _json['passwordconfirm']).decode('utf-8')
        existing_user = mongo.db.userReg.find_one({'email': _email})
        if(existing_user):
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'Email is already exists', 'status': 200, }
            }
            return jsonify(message)
        # existing_referrer = mongo.db.userReg.find_one(
        #     {'referrer_email': _referrer_email})
        # if(existing_referrer):
        #     message = {
        #         'data': "null",
        #         'result': {'isError': 'true', 'message': 'Referrer Email is invalid or not exist in our system', 'status': 200, }
        #     }
        #     return jsonify(message)
        if _name and _email and _password and request.method == 'POST' and (existing_user is None):

            # insert details and generate id
            # mongo.save_file(_file.filename, _file)
            _insertId = mongo.db.userReg.insert({'firstname': _firstname, 'middlename': _middlename, 'lastname': _lastname, 'name': _name,
                                                 'email': _email, 'password': _password,
                                                 'passwordconfirm': _passwordconfirm, 'user_category': _user_category,
                                                 'student_type': _student_type, 'job_type': _job_type,
                                                 'specialization_type': _specialization_type, 'address': _address, 'phone': _phone,
                                                 'country': _country, 'image': _image, 'referrer_name': _referrer_name,
                                                 'referrer_email': _referrer_email, 'emailconfirm': _emailconfirm,
                                                 'roles': [], 'groups': [], 'ts': [], 'friends': []})

            # mongo.db.upload.insert({'upload_file_name': _file.filename})
            # for json response
            print(_insertId)
            token = safeSerializer.dumps(_referrer_email, salt='email-confirm')
            msg = Message(subject='Account Confirmation',
                          sender='admin@iritatech.com', recipients=[_referrer_email])
            link = url_for('confirm_email', token=token,
                           id=_insertId, _external=True)
            msg.body = """A user wants to create account using your reference.
            The user acivation link is {}""".format(link)
            msgReply = mail.send(msg)
            print('Token = ', token)
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'User data insert and mail sending successfully', 'status': 200, }
            }
            return jsonify(message)
        else:
            message = {
                'data': "null",
                'result': {'isError': 'true', 'message': 'User added unsuccessfull', 'status': 200, }
            }
            return jsonify(message)
    except:
        return internal_error()

# Confirm Email


@app.route('/confirm_account')
def confirm_account():
    return 'Successful'


@app.route('/confirm_email/<token>/<id>')
def confirm_email(token, id):
    try:
        _id = id
        # print('ID = ', _id)
        _email = safeSerializer.loads(
            token, salt='email-confirm', max_age=3600)
        _emailconfirm = True
        _date = datetime.datetime.now()
        _update = mongo.db.userReg.update_one(
            {'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
            {'$set': {'emailconfirm': _emailconfirm, 'date': _date}}
        )
        # print(_email)
        # print(_update)
        user = mongo.db.userReg.find_one({'_id': ObjectId(_id)})
        if(user):
            _userEmail = user['email']
            token = safeSerializer.dumps(_userEmail, salt='email-confirm')
            msg = Message(subject='Account Confirmation',
                          sender='ali.ak133058@gmail.com', recipients=[_userEmail])
            link = url_for('confirm_account', _external=True)
            msg.body = """Hello, Your account was successfully created in http://agriculturist.org
            Please click the link to login"""
            msgReply = mail.send(msg)
    except SignatureExpired:
        return '<h1>The session is expired! The user have to be registered again!</h1>'
    except:
        _id = id
        # print('Id in except = ', _id)
        existing_user = mongo.db.userReg.find_one({'_id': ObjectId(_id)})
        # print(existing_user)
        if(existing_user):
            mongo.db.userReg.delete_one({'_id': ObjectId(_id)})
        return '<h1>The account is not registered</h1>'
    return '<h1>The account is activated! Now the user can login.</h1>'

# Getting All user


@app.route('/getAllUser')
@cross_origin(supports_credentials=True)
@token_required
def getAllUser():

    # mongo query for finding all value
    users = mongo.db.userReg.find()
    # print(user)
    if users:
        message = {
            'data': dumps(users),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# showing all user


@app.route('/user')
@cross_origin(supports_credentials=True)
@token_required
def getUser():
    # data = jwt.decode(token, app.config['SECRET_KEY'])
    user = session['user']
    # print(user)
    # mongo query for finding all value
    user = mongo.db.userReg.find_one({'email': user})
    # print(user)
    if user:
        message = {
            'data': dumps(user),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# showing specific user


@app.route('/searchUser', methods=['POST'])
@cross_origin(supports_credentials=True)
def searchUser():
    _json = request.json
    _searchUserData = _json['search_user']
    print(_searchUserData)
    # mongo query for finding all value
    _searchUser = mongo.db.userReg.find_one({'email': _searchUserData})
    if _searchUser:
        message = {
            'data': dumps(_searchUser),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    _searchUser = mongo.db.userReg.find_one({'name': _searchUserData})
    if _searchUser:
        print(_searchUser)
        message = {
            'data': dumps(_searchUser),
            'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
        }
        return jsonify(message)
    return not_found()


@app.route('/user/<id>')
@cross_origin(supports_credentials=True)
@token_required
def user(id):
    # mongo query for finding specific id
    user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
    message = {
        'data': {'user': dumps(user)},
        'result': {'isError': 'false', 'message': 'Valid', 'status': 200, }
    }
    return jsonify(message)


# Showing search user


# delete specific user


@app.route('/delete_ac/<id>', methods=['DELETE'])
@token_required
def delete_user(id):
    existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
    if existing_user and request.method == 'DELETE':
        # mongo query for pull specific friend from other userRegs
        mongo.db.userReg.update_many(
            {}, {'$pull': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
        # mongo query for deleting specific id
        users = mongo.db.userReg.delete_one({'_id': ObjectId(id)})
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'User deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# update user info


@app.route('/update/<id>', methods=['PUT'])
def update_user(id):
    _id = id
    _json = request.form
    print(_id)
    _firstname = _json['firstname']
    print(_firstname)
    _middlename = _json['middlename']
    _lastname = _json['lastname']
    _name = _firstname + ' ' + _middlename + ' ' + _lastname
    _user_category = _json['user_category']
    print(_user_category)
    _student_type = _json['student_type']
    _job_type = _json['job_type']
    _specialization_type = _json['specialization_type']
    _email = _json['email']
    _phone = _json['phone']
    _address = _json['address']
    _country = _json['country']

    _image = _json['viewImage']
    print(_country)
    _referrer_name = _json['referrer_name']
    _referrer_email = _json['referrer_email']
    _password = _json['password']
    _passwordconfirm = _json['passwordconfirm']
    if _name and _email and _id and request.method == 'PUT':
        # update mongoDb (query,set)
        mongo.db.userReg.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                    {'$set': {'firstname': _firstname, 'middlename': _middlename, 'lastname': _lastname,
                                              'name': _name, 'email': _email, 'password': _password,
                                              'passwordconfirm': _passwordconfirm, 'user_category': _user_category,
                                              'student_type': _student_type, 'job_type': _job_type,
                                              'specialization_type': _specialization_type, 'address': _address, 'phone': _phone,
                                              'country': _country, 'image': _image, 'referrer_name': _referrer_name,
                                              'referrer_email': _referrer_email,
                                              'roles': [], 'groups': [], 'ts': [], 'friends': []}}
                                    )
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'User updated successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        message = {
            'data': "null",
            'result': {'isError': 'true', 'message': 'User not updated', 'status': 200, }
        }
        return jsonify(message)


@app.errorhandler(404)
def not_found(error=None):
    message = {
        'data': "null",
        'result': {'isError': 'true', 'message': 'Not Found', 'status': 404, }
    }
    return jsonify(message)


@app.errorhandler(400)
def bad_request(error=None):
    message = {
        'data': "null",
        'result': {'isError': 'true', 'message': 'bad_request', 'status': 400, }
    }
    return jsonify(message)


@app.errorhandler(500)
def internal_error(error=None):
    message = {
        'data': "null",
        'result': {'isError': 'true', 'message': 'INTERNAL SERVER ERROR', 'status': 500, }
    }
    return jsonify(message)
# -----------OTP generate-------------------
# -----------Registration End---------------

# -----------User Comment ------------------

# user post


@app.route('/posts/<id>', methods=['POST'])
@cross_origin(supports_credentials=True)
@token_required
def create_post(id):
    # receiving from post
    _json = request.json
    _id = id
    _title = _json['title']
    _body = _json['body']
    _category = _json['category']
    _tags = _json['tags']
    _post_date = datetime.datetime.now()
    print(session)
    print(_id)
    if _id != 'null':
        if _title and _body:
            try:
                postId = mongo.db.posts.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
                                                   {'$set': {
                                                       'title': _title, 'body': _body,
                                                       'category': _category,
                                                       'tags': _tags, 'date': _post_date
                                                   }
                })
                print('PostId = ', postId)
                message = {
                    'data': 'null',
                    'result': {'isError': 'false', 'message': 'post updated successfull', 'status': 201, }
                }
                return jsonify(message)
            except:
                message = {
                    'data': 'null',
                    'result': {'isError': 'true', 'message': 'post updated Unsuccessfull', 'status': 201, }
                }
                return jsonify(message)
    else:
        try:
            # inserting new post
            user = mongo.db.userReg.find_one({'email': session['user']})
            print(user['name'])
            # _file = mongo.send_file(user['image'])
            insertData = mongo.db.posts.insert({
                'title': _title,
                'body': _body,
                'category': _category,
                'tags': _tags,
                'user': {
                    'userId': user['_id'],
                    'status': user['name'],
                    'image': user['image']
                },
                'comments': [],
                'date': _post_date
            })
            print('PostId = ', insertData)
            message = {
                'data': 'null',
                'result': {'isError': 'false', 'message': 'post created successfull', 'status': 201, }
            }
            return jsonify(message)
        except:
            message = {
                'data': 'null',
                'result': {'isError': 'true', 'message': 'post created Unsuccessfull', 'status': 201, }
            }
            return jsonify(message)


@app.route('/getAllPost', methods=['GET'])
@cross_origin(supports_credentials=True)
@token_required
def getAllpost():
    if request.method == 'GET':
        posts = mongo.db.posts.find().sort("date", -1)
        message = {
            'data': dumps(posts),
            'result': {'isError': 'false', 'message': 'Post Successfully return', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@app.route('/get_post/<id>', methods=['GET'])
@cross_origin(supports_credentials=True)
@token_required
def get_post(id):
    # print(ObjectId(id))
    post = mongo.db.posts.find_one({'_id': ObjectId(id)})
    # user = mongo.db.userReg.find_one({'email': session['user']})
    # print(user['name'])
    # print(post)
    if post and request.method == 'GET':
        message = {
            'data': {'post': dumps(post)},
            'result': {'isError': 'false', 'message': 'Post return successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@app.route('/delete_post/<id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@token_required
def delete_post(id):
    existing_post = mongo.db.posts.find_one({'_id': ObjectId(id)})
    if existing_post and request.method == 'DELETE':
        # mongo query for pull specific friend from other userRegs
        # mongo.db.posts.update_many(
        #     {}, {'$pull': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
        # # mongo query for deleting specific id
        post = mongo.db.posts.delete_one({'_id': ObjectId(id)})
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Post deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@app.route('/delete_post', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@token_required
def delete_posts():
    post = mongo.db.posts.delete_many({})
    # for json response
    message = {
        'data': "null",
        'result': {'isError': 'false', 'message': 'Post deleted successfully', 'status': 200, }
    }
    return jsonify(message)
# user comment


@app.route('/comments/<id>', methods=['POST'])
@cross_origin(supports_credentials=True)
@token_required
def new_comment(id):
    try:
        # receving post id fro comment
        _post_id = id
        _json = request.json
        _cmnt_body = _json['cmntBody']
        user = mongo.db.userReg.find_one({'email': session['user']})
        print(session)
    except:
        message = {
            'data': "null",
            'result': {'isError': 'true', 'message': 'Server Error', 'status': 404, }
        }
        return jsonify(message)
    # post wise comment

    comment = {
        '_id': ObjectId(),
        'cmntBody': _cmnt_body,
        'user': {
            'userId': user['_id'],
            'name': user['name'],
            'image': user['image']
        },
        'date': datetime.datetime.now()
    }

    mongo.db.posts.update(
        {'_id': ObjectId(_post_id)},
        {
            '$push': {
                'comments': comment
            }
        }
    )
    message = {
        'data': dumps(comment),
        'result': {'isError': 'false', 'message': 'Comment added successfully', 'status': 201, }
    }
    return jsonify(message)

# Comment Updated


@app.route('/update_comment/<pid>/<cid>', methods=['PUT'])
@cross_origin(supports_credentials=True)
@token_required
def update_comment(pid, cid):
    try:
        _json = request.json
        _cmnt_body = _json['cmntBody']
        print(_cmnt_body)
        cmnt = mongo.db.posts.update_one(
            {'_id': ObjectId(pid), 'comments._id': ObjectId(cid)},
            {'$set': {'comments.$.cmntBody': _cmnt_body}}
        )
        print(cmnt)
        # user = mongo.db.userReg.find_one({'email': session['user']})
        # print(_cmnt_body)
        # mongo.db.posts.update_one(
        #     {'_id': ObjectId(pid)},
        #     {'$pull': {'comments': {'_id': ObjectId(cid)}}}
        # )
        # comment = {
        #     '_id': ObjectId(),
        #     'cmntBody': _cmnt_body,
        #     'user': {
        #         'name': user['name'],
        #         'image': user['image']
        #     },
        #     'date': datetime.datetime.now()
        # }
        # mongo.db.posts.update(
        #     {'_id': ObjectId(pid)},
        #     {
        #         '$push': {
        #             'comments': comment
        #         }
        #     }
        # )
        message = {
            'data': 'null',
            'result': {'isError': 'false', 'message': 'Comment Updated successfully', 'status': 201, }
        }
        return jsonify(message)
        # if _cmnt_body and request.method == 'PUT':
        #     try:
        #         mongo.db.posts.comments.update_one({'_id': ObjectId(_id['$oid']) if '$oid' in _id else ObjectId(_id)},
        #                                            {'$set': {
        #                                                'cmntBody': _cmnt_body,
        #                                                'date': datetime.datetime.now()
        #                                            }
        #         })
        #         message = {
        #             'data': 'null',
        #             'result': {'isError': 'false', 'message': 'comment updated successfull', 'status': 201, }
        #         }
        #         return jsonify(message)
        #     except:
        #         message = {
        #             'data': 'null',
        #             'result': {'isError': 'true', 'message': 'comment updated Unsuccessfull', 'status': 201, }
        #         }
        #         return jsonify(message)
    except:
        return 'error'

# delete comment


@app.route('/delete_comment/<pid>/<cid>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
@token_required
def delete_comment(pid, cid):
    try:
        # # mongo query for deleting specific id
        mongo.db.posts.update_one(
            {'_id': ObjectId(pid)},
            {'$pull': {'comments': {'_id': ObjectId(cid)}}}
        )
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Comment deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    except:
        return not_found()
# comment reply


@app.route('/comments/<pid>/<cid>', methods=['POST'])
def comment_reply(pid, cid):
    try:
        # receivng post & comment id for reply
        _post_id = pid
        _comment_id = cid
        _json = request.json
        _creply_body = _json['repBody']
        _user = session['user']
    except:
        return 'error'
    try:
        # adding reply against specific comment to database
        mongo.db.posts.update({'_id': ObjectId(_post_id),
                               'comments._id': ObjectId(_comment_id)},
                              {'$push': {'comments.$.child': {
                                  'repBody': _creply_body,
                                  'user': session['user'],
                                  'date': datetime.datetime.now()}}})
    except:
        return 'error'
    message = {
        'data': "null",
        'result': {'isError': 'false', 'message': 'Reply added successfully', 'status': 201, }
    }
    return jsonify(message)


# -----------User Comment end---------------

# -----------User Upload ------------------

# file upload with user name
@app.route('/file_upload', methods=['POST'])
@cross_origin(supports_credentials=True)
@token_required
def file_upload():
    # if 'file' not in request.files:
    #     message = {
    #         'data': "null",
    #         'result': {'isError': 'true', 'message': 'No File added in request', 'status': 200, }
    #     }
    #     return jsonify(message)
    # file = request.files['file']
    # if file.filename == '':
    #     message = {
    #         'data': "null",
    #         'result': {'isError': 'true', 'message': 'No image selected for uploading', 'status': 200, }
    #     }
    #     return jsonify(message)
    # if file and allowed_file(file.filename):
    #     filename = secure_filename(file.filename)
    #     print('FileName = ', os.getcwd())
    #     target = os.path.join(UPLOAD_FOLDER, 'test')
    #     print('target = ', target)
    #     if not os.path.isdir(target):
    #         os.mkdir(target)
    #     destination = "/".join([target, filename])
    #     print('Path = ', destination)
    #     file.save(destination)
    #     #file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    #     message = {
    #         'data': "null",
    #         'result': {'isError': 'false', 'message': 'Image successfully uploaded and displayed', 'status': 200, }
    #     }
    #     return jsonify(message)
    # else:
    #     message = {
    #         'data': "null",
    #         'result': {'isError': 'false', 'message': 'Allowed image types are -> png, jpg, jpeg, gif', 'status': 200, }
    #     }
    #     return jsonify(message)
    _file = request.files['file']
    _json = request.form
    print(_file.filename)
    _title = _json['title']
    _desc = _json['description']
    _filedata = _json['filedata']
    _filename = _file.filename
    _file_mimetype = _file.content_type
    # print(_image)
    # print(_json)

    user = mongo.db.userReg.find_one({'email': session['user']})
    mongo.save_file(_file.filename, _file)
    # # mongo.db.upload.insert(
    # #     {'upload_file_name': _file.filename})
    mongo.db.upload.insert(
        {'title': _title, 'desc': _desc, 'filedata': _filedata, 'filename': _filename,
         'file_mimetype': _file_mimetype, 'user': {'userId': user['_id']}, 'date': datetime.datetime.now()})
    # mongo.db.upload.insert({'upload_file_name': _file.filename})
    message = {
        # 'data': dumps(_file.filename),
        'data': "null",
        'result': {'isError': 'false', 'message': 'File added', 'status': 200, }
    }
    return jsonify(message)

# sending file


@app.route('/file/<filename>')
@cross_origin(supports_credentials=True)
def file(filename):
    # response = make_response(send_file(filename, mimetype='image/png'))
    # response.headers['Content-Transfer-Encoding'] = 'base64'
    # return response
    return mongo.send_file(filename)


@app.route('/fileDelete/<id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def fileDelete(id):
    print(id)
    existing_file = mongo.db.upload.find_one({'_id': ObjectId(id)})
    if existing_file and request.method == 'DELETE':
        # mongo query for pull specific friend from other userRegs
        # mongo.db.posts.update_many(
        #     {}, {'$pull': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
        # # mongo query for deleting specific id
        post = mongo.db.upload.delete_one({'_id': ObjectId(id)})
        # for json response
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'File deleted successfully', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


@app.route('/getAllFiles')
def getfile():
    files = mongo.db.upload.find().sort("date", -1)
    message = {
        # 'data': dumps(_file.filename),
        'data': dumps(files),
        'result': {'isError': 'false', 'message': 'File data return', 'status': 200, }
    }
    return jsonify(message)
# @app.route('/image_upload', methods=['POST'])
# def image_upload():

# for browser view(optional)


@app.route('/user_upload/<username>')
def user_upload(username):
    user = mongo.db.upload.find_one_or_404({'username': username})
    return f'''
		<img src="{url_for('file', filename=user['upload_file_name'])}">
	'''
# -----------User upload end ---------------

# .......Role Based Start........................................................................................
# ______________________services____________________________
# Adding new services


@app.route('/add_service', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def add_service():
    _json = request.json
    _service_name = _json['service_name']
    _description = _json['description']
    # check service not exist
    existing_service = mongo.db.services.find_one({'name': _service_name})
    if _service_name and (existing_service is None) and request.method == 'POST':
        # insert new service
        mongo.db.services.insert(
            {'name': _service_name, 'description': _description})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# delete specific service


@app.route('/delete_service/<id>', methods=['DELETE'])
def delete_service(id):
    existing_service = mongo.db.services.find_one({'_id': ObjectId(id)})
    if existing_service and request.method == 'DELETE':
        # mongo query for pull specific id from other collections
        mongo.db.roles.update_many(
            {}, {'$pull': {'services': DBRef(collection="services", id=ObjectId(id))}})
        mongo.db.groups.update_many(
            {}, {'$pull': {'services': DBRef(collection="services", id=ObjectId(id))}})
        # mongo query for deleting specific id
        service = mongo.db.services.delete_one({'_id': ObjectId(id)})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Service deleted successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# ______________________roles____________________________
# adding existing services to (new/existing)Role


@app.route('/serviceto_role', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def serviceto_role():
    _json = request.json
    _role_name = _json['role_name']
    _service_name = _json['service_name']
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    existing_service = mongo.db.services.find_one({'name': _service_name, })
    # Add new service if not exist
    if (existing_service is None) and _role_name:
        mongo.db.services.insert({'name': _service_name, 'description': ''})
    # Add new role if not exist
    if (existing_role is None) and _service_name:
        mongo.db.roles.insert(
            {'name': _role_name, 'description': '', 'services': []})
    # check if Role already has the service
    if _role_name and existing_service:
        existing_serviced = mongo.db.roles.find_one({'name': _role_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced is None) and request.method == 'POST':
        # update role with new existing service
        mongo.db.roles.update_one({'name': _role_name}, {'$push': {
                                  'services': DBRef(collection="services", id=existing_service['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_to_role_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted service from Role


@app.route('/rm_service_fromrole', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def rm_service_fromrole():
    _json = request.json
    _role_name = _json['role_name']
    _service_name = _json['service_name']
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    existing_service = mongo.db.services.find_one({'name': _service_name, })
    # check if Role already has the service
    if _role_name and existing_service:
        existing_serviced = mongo.db.roles.find_one({'name': _role_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced) and request.method == 'POST':
        # update role with pop the target existing service
        mongo.db.roles.update_one({'name': _role_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])}, {'$pop': {'services': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_service_fromrole_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()
# delete specific role


@app.route('/delete_role/<id>', methods=['DELETE'])
def delete_role(id):
    existing_role = mongo.db.roles.find_one({'_id': ObjectId(id)})
    if existing_role and request.method == 'DELETE':
        # mongo query for pull specific id from other collections
        mongo.db.groups.update_many(
            {}, {'$pull': {'roles': DBRef(collection="roles", id=ObjectId(id))}})
        mongo.db.userReg.update_many(
            {}, {'$pull': {'roles': DBRef(collection="roles", id=ObjectId(id))}})
        # mongo query for deleting specific id
        service = mongo.db.roles.delete_one({'_id': ObjectId(id)})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Role deleted successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# ______________________groups____________________________
# adding services to group


@app.route('/serviceto_group', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def serviceto_group():
    _json = request.json
    _service_name = _json['service_name']
    _group_name = _json['group_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_service = mongo.db.services.find_one({'name': _service_name})
    # Add new service if not exist
    if (existing_service is None) and _group_name:
        mongo.db.services.insert({'name': _service_name, 'description': ''})
    # Add new group if not exist
    if _group_name and (existing_group is None):
        mongo.db.groups.insert(
            {'name': _group_name, 'description': '', 'roles': [], 'services': []})
    # check if Gropu already has the service
    if _group_name and existing_service:
        existing_serviced = mongo.db.groups.find_one({'name': _group_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced is None) and request.method == 'POST':
        # update groups with new existing service
        mongo.db.groups.update_one({'name': _group_name}, {'$push': {
                                   'services': DBRef(collection="services", id=existing_service['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_to_role_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# adding role to group


@app.route('/roleto_group', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def roleto_group():
    _json = request.json
    _group_name = _json['group_name']
    _role_name = _json['role_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    # Add new group if not exist
    if _group_name and (existing_group is None):
        mongo.db.groups.insert(
            {'name': _group_name, 'description': '', 'roles': [], 'services': []})
    # check if Group already has the Role
    if _group_name and existing_role:
        existing_roled = mongo.db.groups.find_one(
            {'name': _group_name, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_role and (existing_roled is None) and request.method == 'POST':
        # Update groups with new existing role
        mongo.db.groups.update_one({'name': _group_name}, {
                                   '$push': {'roles': DBRef(collection="roles", id=existing_role['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'service_to_role_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted service from group


@app.route('/rm_service_fromgroup', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def rm_service_fromgroup():
    _json = request.json
    _group_name = _json['group_name']
    _service_name = _json['service_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_service = mongo.db.services.find_one({'name': _service_name, })
    # check if Role already has the service
    if _group_name and existing_service:
        existing_serviced = mongo.db.groups.find_one({'name': _group_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])})
    if existing_service and (existing_serviced) and request.method == 'POST':
        # update role with pop the target existing service
        mongo.db.groups.update_one({'name': _group_name, 'services': DBRef(
            collection="services", id=existing_service['_id'])}, {'$pop': {'services': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_service_fromgroup_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted role from group


@app.route('/rm_role_fromgroup', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def rm_role_fromgroup():
    _json = request.json
    _group_name = _json['group_name']
    _role_name = _json['role_name']
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    existing_role = mongo.db.roles.find_one({'name': _role_name, })
    # check if Role already has the service
    if _group_name and existing_role:
        existing_roled = mongo.db.groups.find_one(
            {'name': _group_name, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_role and (existing_roled) and request.method == 'POST':
        # update role with pop the target existing role
        mongo.db.groups.update_one({'name': _group_name, 'roles': DBRef(
            collection="roles", id=existing_role['_id'])}, {'$pop': {'roles': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_role_fromgroup_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# delete specific group


@app.route('/delete_group/<id>', methods=['DELETE'])
def delete_group(id):
    existing_group = mongo.db.groups.find_one({'_id': ObjectId(id)})
    if existing_group and request.method == 'DELETE':
        # mongo query for pull specific id from other collections
        mongo.db.userReg.update_many(
            {}, {'$pull': {'groups': DBRef(collection="groups", id=ObjectId(id))}})
        # mongo query for deleting specific id
        service = mongo.db.groups.delete_one({'_id': ObjectId(id)})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'group deleted successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# ______________________userReg____________________________
# adding role to user


@app.route('/roleto_user', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def roleto_user():
    _json = request.json
    _user_email = _json['user_email']
    _role_name = _json['role_name']

    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_role = mongo.db.roles.find_one({'name': _role_name})
    # check if user already has the Role
    if _user_email and existing_role:
        existing_roled = mongo.db.userReg.find_one(
            {'email': _user_email, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_user and existing_role and (existing_roled is None) and request.method == 'POST':
        # update user with new existing role
        mongo.db.userReg.update_one({'email': _user_email}, {
                                    '$push': {'roles': DBRef(collection="roles", id=existing_role['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'role_to_user_added_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# adding existing group to userReg


@app.route('/groupto_user', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def groupto_user():
    _json = request.json
    _user_email = _json['user_email']
    _group_name = _json['group_name']

    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_group = mongo.db.groups.find_one({'name': _group_name})
    # check if user already has the group
    if existing_user and existing_group:
        existing_grouped = mongo.db.userReg.find_one(
            {'email': _user_email, 'groups': DBRef(collection="groups", id=existing_group['_id'])})
    if existing_user and existing_group and (existing_grouped is None) and request.method == 'POST':
        # update userReg with new existing group
        mongo.db.userReg.update_one({'email': _user_email}, {
                                    '$push': {'groups': DBRef(collection="groups", id=existing_group['_id'])}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Group_To_User_Added_Successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted role from user


@app.route('/rm_role_fromuser', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def rm_role_fromuser():
    _json = request.json
    _user_email = _json['user_email']
    _role_name = _json['role_name']
    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_role = mongo.db.roles.find_one({'name': _role_name, })
    # check if userReg already has the role
    if _user_email and existing_role:
        existing_roled = mongo.db.userReg.find_one(
            {'email': _user_email, 'roles': DBRef(collection="roles", id=existing_role['_id'])})
    if existing_role and (existing_roled) and request.method == 'POST':
        # update userReg with pop the target existing role
        mongo.db.userReg.update_one({'email': _user_email, 'roles': DBRef(
            collection="roles", id=existing_role['_id'])}, {'$pop': {'roles': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_role_fromuser_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# remove targeted group from userReg


@app.route('/rm_group_fromuser', methods=['POST', 'GET'])
@cross_origin(supports_credentials=True)
def rm_group_fromuser():
    _json = request.json
    _user_email = _json['user_email']
    _group_name = _json['group_name']
    existing_user = mongo.db.userReg.find_one({'email': _user_email})
    existing_group = mongo.db.groups.find_one({'name': _group_name, })
    # check if user already has the group
    if _user_email and existing_group:
        existing_grouped = mongo.db.userReg.find_one(
            {'email': _user_email, 'groups': DBRef(collection="groups", id=existing_group['_id'])})
    if existing_group and (existing_grouped) and request.method == 'POST':
        # update userReg with pop the target existing group
        mongo.db.userReg.update_one({'email': _user_email, 'groups': DBRef(
            collection="groups", id=existing_group['_id'])}, {'$pop': {'groups': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'rm_group_fromuser_successfully', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# Update user total service list(ts)


@app.route('/update', methods=['POST', 'GET'])
def update():
    # _user_email=session['email']
    user = mongo.db.userReg.find_one({'email': session['email']})
    total = []
    # collect services from user groups
    for role in user['roles']:
        for service in mongo.db.dereference(role)["services"]:
            total.append(mongo.db.dereference(service))
    # collect services from user groups
    for group in user['groups']:
        for service in mongo.db.dereference(group)["services"]:
            total.append(mongo.db.dereference(service))
        for role in mongo.db.dereference(group)["roles"]:
            for service in mongo.db.dereference(role)["services"]:
                total.append(mongo.db.dereference(service))
    # remove duplicates using pandas
    ts = pd.DataFrame(total).drop_duplicates().to_dict('records')
    mongo.db.userReg.update_one(
        {'email': session['email']}, {"$set": {"ts": ts}})
    resp = dumps(ts)
    return resp
# .......role based end........................

# ..........friends start......................

# adding existing friend to (existing)userReg


@app.route('/friendReq/<id>', methods=['POST', 'GET'])
def friendReq(id):
    current_user = mongo.db.userReg.find_one({'email': session['email']})
    existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
    # check if userReg already has the friend
    existing_friend = mongo.db.userReg.find_one(
        {'email': session['email'], 'friends': DBRef(collection="userReg", id=ObjectId(id))})
    if existing_friend:
        # existing_friend = mongo.db.userReg.find_one({'email':session['email'], 'friends':DBRef(collection = "userReg", id = ObjectId(id) )  })
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Friend Already Exist', 'status': 200, }
        }
        return jsonify(message)
    if existing_user and (existing_user != current_user) and (existing_friend is None) and request.method == 'POST':
        # update userReg with new existing friend
        # mongo.db.userReg.update_one({'email':session['email'] },{ '$push': {'friend_pending': DBRef(collection = "userReg", id = ObjectId(id) ) } })
        mongo.db.userReg.update_one({'_id': ObjectId(id)}, {'$push': {
                                    'friend_pending': DBRef(collection="userReg", id=current_user['_id'])}})

        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Friend Request Sent', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()

# acceptFriend Request


@app.route('/friendReqAccept/<id>', methods=['POST', 'GET'])
def acceptFriendReq(id):
    current_user = mongo.db.userReg.find_one({'email': session['email']})
    pending_friend = mongo.db.userReg.find_one(
        {'email': session['email'], 'friend_pending': DBRef(collection="userReg", id=ObjectId(id))})

    if pending_friend:
        # adding in both users friend list
        mongo.db.userReg.update_one({'email': session['email']}, {
                                    '$push': {'friends': DBRef(collection="userReg", id=ObjectId(id))}})
        mongo.db.userReg.update_one({'_id': ObjectId(id)}, {
                                    '$push': {'friends': DBRef(collection="userReg", id=current_user['_id'])}})
        mongo.db.userReg.update_one({'email': session['email'], 'friend_pending': DBRef(
            collection="userReg", id=ObjectId(id))}, {'$pop': {'friend_pending': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Friend Request Accepted', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()

# deleteFriend Request


@app.route('/friendReqDel/<id>', methods=['POST', 'GET'])
def friendReqDel(id):
    current_user = mongo.db.userReg.find_one({'email': session['email']})
    pending_friend = mongo.db.userReg.find_one(
        {'email': session['email'], 'friend_pending': DBRef(collection="userReg", id=ObjectId(id))})

    if pending_friend:
        mongo.db.userReg.update_one({'email': session['email'], 'friend_pending': DBRef(
            collection="userReg", id=ObjectId(id))}, {'$pop': {'friend_pending': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Friend Request Declined', 'status': 200, }
        }
        return jsonify(message)
    else:
        return not_found()


# remove targeted friend from userReg
@app.route('/rmFriend/<id>', methods=['POST', 'GET'])
def rmFriend(id):
    current_user = mongo.db.userReg.find_one({'email': session['email']})
    existing_user = mongo.db.userReg.find_one({'_id': ObjectId(id)})
    # check if userReg already has the friend
    if existing_user:
        existing_friend = mongo.db.userReg.find_one(
            {'email': session['email'], 'friends': DBRef(collection="userReg", id=ObjectId(id))})
        if existing_friend is None:
            message = {
                'data': "null",
                'result': {'isError': 'false', 'message': 'User not found in your friend list', 'status': 200, }
            }
            # for json response
            return jsonify(message)
    if existing_user and (existing_friend) and request.method == 'POST':
        # update userReg with pop the target existing friend
        mongo.db.userReg.update_one({'email': session['email'], 'friends': DBRef(
            collection="userReg", id=ObjectId(id))}, {'$pop': {'friends': -1}})
        mongo.db.userReg.update_one({'_id': ObjectId(id), 'friends': DBRef(
            collection="userReg", id=current_user['_id'])}, {'$pop': {'friends': -1}})
        message = {
            'data': "null",
            'result': {'isError': 'false', 'message': 'Removed from friend list', 'status': 200, }
        }
        # for json response
        return jsonify(message)
    else:
        return not_found()


# ................friends end..........................
if __name__ == "__main__":
    app.run(debug=True)
