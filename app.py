from flask import Flask, request, jsonify, render_template, send_from_directory
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

app = Flask(__name__)

# df holds all of the original points and their classes
df = pd.DataFrame(columns=['x', 'y', 'class'], dtype=np.float64)
# X holds all of the features, including the higher dimensions ones (i.e. the squared ones)
X, y, w = np.array([]), np.array([]), np.array([])

current_degree = None

is_converged = False
info_text = None
is_new_point_added = True

epsilon = 1e-6

max_axis_val = 10
x_min, x_max = -max_axis_val, max_axis_val
y_min, y_max = x_min, x_max

# Linear regression variables
# This variable holds 1000 values between -10 and 10 to draw the line on the linear regression graph
og_line_x_vals = np.linspace(x_min, x_max + 1, 1000).reshape(-1, 1)
# This variable holds the X features including any higher dimension ones for the og_line_x_vals
gd_line_x = None

# logistic regression variables
_range = x_max - x_min
a, b = np.meshgrid(np.linspace(-_range / 2, _range / 2, 100), np.linspace(-_range / 2, _range / 2, 100))
new_features = None

# k means variables
classes = list(range(5))
centroids = None
k = None
step_find_closest_centroid = True

@app.route('/')
def main():
    return render_template("index.html")


@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/clear')
def clear_window():
    global X, y, w, line, current_degree, df, centroids
    df = pd.DataFrame(columns=['x', 'y', 'class'], dtype=np.float)
    X, y, w = np.array([]), np.array([]), np.array([])
    centroids = None


@app.route('/add-point', methods=['POST'])
def add_point():
    global is_converged, is_new_point_added, scatter

    is_converged = False
    is_new_point_added = True
    data = request.get_json()

    df.loc[len(df)] = [data['x'], data['y'], data['class']]

    return jsonify({'status': 'success'})


#### LINEAR REGRESSION ####
@app.route('/linreg')
def linear_regression():
    clear_window()
    return render_template("linreg.html")


@app.route('/linreg-grad-desc', methods=['POST'])
def linreg_gradient_descent():
    global current_degree, is_new_point_added, X, y, w, is_converged, gd_line_x
    line_points = []
    if len(df) != 0:
        new_degree = int(request.get_json()['degree'])
        if new_degree != current_degree or is_new_point_added:
            x_vals = []
            line_x_vals = []
            for i in range(new_degree + 1):
                x_vals.append(df[['x']].to_numpy() ** i)
                line_x_vals.append(og_line_x_vals ** i)
            X = np.hstack(x_vals)

            y = df['y'].to_numpy().reshape((-1, 1))
            gd_line_x = np.hstack(line_x_vals)

            w = np.zeros((new_degree + 1, 1))
            current_degree = new_degree
            is_converged = False
            is_new_point_added = False

        if not is_converged:
            tau = (1 / (np.linalg.norm(X, ord=2) ** 2)) * 0.99 # step size
            for i in range(request.get_json()['num_of_iterations']):
                if is_converged:
                    break
                z = w - tau * X.T @ (X @ w - y)
                if np.linalg.norm(w - z) < epsilon:
                    is_converged = True
                w = z

            line_x_coords = gd_line_x[:, [1]]
            line_y_coords = gd_line_x @ w
            for _x, _y in zip(line_x_coords, line_y_coords):
                line_points.append({
                    "x": _x.item(),
                    "y": _y.item()
                })

    w_list = [round(i.item(), 3) for i in w]
    update_converged_text()

    return jsonify({'line_points': line_points,
                    'converged': info_text,
                    'cost': round(cost(), 2),
                    'coefficients': w_list})


#### LOGISTIC REGRESSION ####
@app.route('/logreg')
def logistic_regression():
    clear_window()
    return render_template("logreg.html")


@app.route('/logreg-grad-desc', methods=['POST'])
def logreg_gradient_descent():
    global current_degree, is_new_point_added, X, y, w, is_converged, line, gd_line_x, a, b, new_features
    line_points = []
    if len(df) != 0:
        new_degree = int(request.get_json()['degree'])
        # If the degree was changed or if a new point was added, we need to recreate the entire X dataset with the
        # higher order features vvv
        if new_degree != current_degree or is_new_point_added:
            x_vals = [np.ones((len(df), 1))]
            ab = [np.ones_like(a)]
            for i in range(1, new_degree + 1):
                x_vals.append(df[['y', 'x']].to_numpy() ** i)
                ab.extend([b ** i, a ** i])

            X = np.hstack(x_vals)
            new_features = np.stack(ab, axis=2)
            y = df[['class']].replace([0, 1], [-1, 1]).to_numpy()
            w = np.zeros((new_degree * 2 + 1, 1))

            current_degree = new_degree
            is_converged = False
            is_new_point_added = False

        if not is_converged:
            tau = (1 / (np.linalg.norm(X, ord=2) ** 2)) * 0.999
            for i in range(request.get_json()['num_of_iterations']):
                if is_converged:
                    break
                z = w - tau * X.T @ (X @ w - y)
                if np.linalg.norm(w - z) < epsilon:
                    is_converged = True
                w = z

            C = new_features @ w
            ax = plt.subplot()
            contour = ax.contour(a, b, C.squeeze(), 0, colors='k', linewidths=3)

            contour_path = contour.collections[1].get_paths()[0]
            for _x, _y in contour_path.vertices:
                line_points.append({
                    "x": _x,
                    "y": _y
                })

    w_list = [round(i.item(), 3) for i in w]

    update_converged_text()

    return jsonify({'line_points': line_points,
                    'converged': info_text,
                    'cost': round(cost(), 2),
                    'coefficients': w_list})


#### K-MEANS ####
@app.route('/kmeans')
def k_means():
    global step_find_closest_centroid
    clear_window()
    step_find_closest_centroid = True
    return render_template("kmeans.html")


@app.route('/kmeans-iteration', methods=['POST'])
def k_means_iteration():
    global centroids, k, is_converged, step_find_closest_centroid
    new_k = int(request.get_json()['num_of_clusters'])

    if len(df) != 0:
        if centroids is None or k != new_k:
            k = new_k
            if len(df) >= new_k:
                centroids = df.sample(k)
                centroids['class'] = classes[:k]
                centroids.set_index('class', inplace=True)
            step_find_closest_centroid = True
            is_converged = False

        if not is_converged and len(df) >= new_k:
            for i in range(request.get_json()['num_of_iterations']):
                if is_converged:
                    break
                if step_find_closest_centroid:
                    df['class'] = df.apply(find_closest_centroid, axis=1)
                else:
                    new_centroids = pd.DataFrame(centroids.apply(move_centroids, axis=1).to_list(), columns=['x', 'y'])
                    if centroids['x'].to_list() == new_centroids['x'].to_list() and centroids['y'].to_list() == \
                            new_centroids['y'].to_list():
                        is_converged = True
                    centroids['x'], centroids['y'] = new_centroids['x'].to_list(), new_centroids['y'].to_list()
                step_find_closest_centroid = not step_find_closest_centroid

    update_converged_text()

    return kmeans_return()


def find_closest_centroid(row):
    closest_distance = None
    closest_centroid = None
    for i, coord in centroids.iterrows():
        distance = np.linalg.norm(row.to_numpy()[:2] - coord.to_numpy())
        if closest_distance is None or distance < closest_distance:
            closest_distance = distance
            closest_centroid = i
    return closest_centroid


def move_centroids(row):
    x_sum = 0
    y_sum = 0
    num_of_points = 0
    for i, point in df.iterrows():
        if row.name == point['class']:
            x_sum += point['x']
            y_sum += point['y']
            num_of_points += 1

    return x_sum / num_of_points, y_sum / num_of_points


def kmeans_return():
    if len(df) == 0:
        next_step = "Initialize centroids"
    elif is_converged:
        next_step = "Centroids haven't moved"
    elif step_find_closest_centroid:
        next_step = "Click to recolor the points based on closest centroid"
    else:
        next_step = "Click to move the centroids to the average of the points in their clusters"

    data_points = {0: [], 1: [], 2: [], 3: [], 4: []}
    centroids_coords = {0: {}, 1: {}, 2: {}, 3: {}, 4: {}}
    for i, row in df.iterrows():
        data_points[row['class']].append({
            "x": row['x'],
            "y": row['y']
        })
    for i, row in centroids.iterrows():
        centroids_coords[i] = {
            "x": row['x'],
            "y": row['y']
        }

    return jsonify({'data_points': data_points,
                    'centroids_coords': centroids_coords,
                    'converged': info_text,
                    'next_step': next_step})



@app.route("/kmeans-reinitialize", methods=["POST"])
def reinitialize_centroids():
    global k, centroids, step_find_closest_centroid, is_converged
    k = int(request.get_json()['num_of_clusters'])
    if len(df) >= k:
        centroids = df.sample(k)
        centroids['class'] = classes[:k]
        centroids.set_index('class', inplace=True)

        step_find_closest_centroid = False
        is_converged = False

        df['class'] = df.apply(find_closest_centroid, axis=1)

        update_converged_text()
    return kmeans_return()


#### HELPER FUNCTIONS ####
def cost():
    return np.sum((X @ w - y) ** 2)


def update_converged_text():
    global info_text
    if len(df) == 0:
        info_text = "Click on the graph to add data points"
    elif k is not None and len(df) < k:
        info_text = "Add more data points than clusters"
    elif is_converged:
        info_text = "Algorithm has converged"
    else:
        info_text = "Algorithm has not converged"


if __name__ == '__main__':
    app.run(debug=True)
