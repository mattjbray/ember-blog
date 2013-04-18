require 'sinatra'
require 'mongoid'

module Mongoid
  module Serialization
    def serializable_hash_with_id(options = nil)
      json = serializable_hash_without_id options
      json['id'] = json['_id'] if json.has_key? '_id'
      json
    end
    alias_method_chain :serializable_hash, :id
  end
end

Mongoid.configure do |config|
  config.connect_to( ENV['MONGOHQ_URL'] || 'ember_blog' )
end

class Post
  include Mongoid::Document
  include Mongoid::Timestamps
  field :title, type: String
  field :author, type: String
  field :intro, type: String
  field :extended, type: String

  validates :title, presence: true
  validates :author, presence: true
  validates :intro, presence: true
  validates :extended, presence: true
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

post '/posts' do
  payload = JSON.parse(request.body.read)
  post = Post.create( payload["post"] )

  if post.valid?
    { post: post }.to_json
  else
    response.status = 422
    { post: post,
      errors: post.errors }.to_json
  end
end

get '/posts' do
  { posts: Post.all.as_json }.to_json
end

get '/posts/:post_id' do
  post = Post.find( params[:post_id] )

  { post: post.as_json }.to_json
end

put '/posts/:post_id' do |post_id|
  payload = JSON.parse(request.body.read)
  post = Post.find( post_id )

  post.assign_attributes( payload["post"] )

  if post.save
    { post: post }.to_json
  else
    response.status = 422
    { post: post,
      errors: post.errors }.to_json
  end
end

delete '/posts/:post_id' do |post_id|
  post = Post.find( post_id )
  post.destroy
  response.status = 204
end
