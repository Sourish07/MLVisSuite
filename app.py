from io import BytesIO

from flask import Flask, request, jsonify, Response, render_template
import matplotlib.pyplot as plt, mpld3
from mpld3 import fig_to_html, plugins
import pandas as pd
import numpy as np

app = Flask(__name__)

X, y, w = np.array([]), np.array([]), np.array([])
df = None
fig, ax = None, None

line, scatter, gd_line_x = None, None, None
current_degree = None

is_converged = False
info_text = None
is_new_point_added = True

epsilon = 1e-6

max_axis_val = 10
x_min, x_max = -max_axis_val, max_axis_val
y_min, y_max = x_min, x_max

og_line_x_vals = np.linspace(x_min, x_max + 1, 1000).reshape(-1, 1)

# logistic regression variables
_range = x_max - x_min
a, b = np.meshgrid(np.linspace(-_range / 2, _range / 2, 100), np.linspace(-_range / 2, _range / 2, 100))
contour = None
new_features = None


# k means variables
classes = ["r", "b", "g", "c", "m"]
centroids = None
k = None
step_find_closest_centroid = True
scatter_points = None

@app.route('/')
def main():
    return render_template("index.html")


@app.route('/clear')
def clear_window():
    global X, y, fig, ax, w, line, current_degree, df, centroids
    df = pd.DataFrame(columns=['x', 'y', 'class'], dtype=np.float)
    centroids = None

    fig, ax = plt.subplots()
    ax.set(xlim=(x_min, x_max), ylim=(y_min, y_max))

    mpld3.plugins.clear(fig)
    plugins.connect(fig, plugins.MousePosition(fontsize=0))
    plugins.connect(fig, MoveAxis())


@app.route('/add-point', methods=['POST'])
def add_point():
    global is_converged, is_new_point_added, scatter

    is_converged = False
    is_new_point_added = True
    data = request.get_json()

    df.loc[len(df)] = [data['x'], data['y'], data['class']]

    if scatter is not None:
        scatter.remove()
    scatter = ax.scatter(df['x'], df['y'], color=df['class'], s=10)
    return get_html_fig()


#### LINEAR REGRESSION ####
@app.route('/linreg')
def linear_regression():
    global line
    clear_window()
    line = ax.plot(og_line_x_vals, np.zeros_like(og_line_x_vals), color='k', linewidth=3)
    return render_template("linreg.html", graph=get_html_fig())


@app.route('/linreg-grad-desc', methods=['POST'])
def linreg_gradient_descent():
    global current_degree, is_new_point_added, X, y, w, is_converged, line, gd_line_x
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

            line.pop().remove()
            line = ax.plot(gd_line_x[:, [1]], gd_line_x @ w, color='k', linewidth=3)

    w_list = [round(i.item(), 3) for i in w]

    update_converged_text()

    return jsonify({'graph': get_html_fig(),
                    'converged': info_text,
                    'cost': round(cost(), 2),
                    'coefficients': w_list})


#### LOGISTIC REGRESSION ####
@app.route('/logreg')
def logistic_regression():
    global contour
    clear_window()
    C = np.stack([a, b], axis=2) @ np.array([[0], [1]])
    contour = ax.contour(a, b, C.squeeze(), 0, colors='k', linewidths=3)
    return render_template("logreg.html", graph=get_html_fig())


@app.route('/logreg-grad-desc', methods=['POST'])
def logreg_gradient_descent():
    global current_degree, is_new_point_added, X, y, w, is_converged, line, gd_line_x, a, b, contour, new_features
    if len(df) != 0:
        new_degree = int(request.get_json()['degree'])
        # If the degree was changed or if a new point was added, we need to recreate the entire X dataset with the
        # higher order features vvv
        if new_degree != current_degree or is_new_point_added:
            x_vals = [np.ones((len(df), 1))]
            ab = [np.ones_like(a)]
            for i in range(1, new_degree + 1):
                x_vals.append(df[['x', 'y']].to_numpy() ** i)
                ab.extend([a ** i, b ** i])

            X = np.hstack(x_vals)
            new_features = np.stack(ab, axis=2)
            y = df[['class']].replace(["r", "b"], [-1, 1]).to_numpy()
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

            if contour is not None:
                for coll in contour.collections:
                    coll.remove()

            C = new_features @ w
            contour = ax.contour(a, b, C.squeeze(), 0, colors='k', linewidths=3)

    w_list = [round(i.item(), 3) for i in w]

    update_converged_text()

    return jsonify({'graph': get_html_fig(),
                    'converged': info_text,
                    'cost': round(cost(), 2),
                    'coefficients': w_list})


#### K-MEANS ####
@app.route('/kmeans')
def k_means():
    global step_find_closest_centroid
    clear_window()
    step_find_closest_centroid = True
    return render_template("kmeans.html", graph=get_html_fig())


@app.route('/kmeans-iteration', methods=['POST'])
def k_means_iteration():
    global centroids, k, is_converged, step_find_closest_centroid, scatter_points, fig, ax
    new_k = int(request.get_json()['num_of_clusters'])

    if len(df) != 0:
        if centroids is None or k != new_k:
            k = new_k
            if len(df) >= new_k:
                centroids = df.sample(k)
                centroids['class'] = classes[:k]
                centroids.set_index('class', inplace=True)
            step_find_closest_centroid = True

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

            redraw_kmeans()

    update_converged_text()

    return jsonify({'graph': get_html_fig(),
                    'converged': info_text})

def redraw_kmeans():
    ax.clear()
    ax.set(xlim=(x_min, x_max), ylim=(y_min, y_max))

    ax.scatter(df['x'], df['y'], color=df['class'], s=10)
    for i, row in centroids.iterrows():
        ax.scatter(row['x'], row['y'], color=row.name, marker="*", s=500, alpha=0.5)


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

    redraw_kmeans()
    update_converged_text()
    return jsonify({'graph': get_html_fig(),
                    'converged': info_text})


#### HELPER FUNCTIONS ####
def cost():
    return np.sum((X @ w - y) ** 2)


def get_html_fig():
    return fig_to_html(fig, figid="figure")


def update_converged_text():
    global info_text
    if len(df) == 0:
        info_text = "Click to add data"
    elif k is not None and len(df) < k:
        info_text = "Add more data points than clusters"
    elif is_converged:
        info_text = "Algorithm has converged"
    else:
        info_text = "Algorithm has not converged"


class MoveAxis(plugins.PluginBase):
    JAVASCRIPT = """
        mpld3.register_plugin("moveaxis", MoveAxis);
        MoveAxis.prototype = Object.create(mpld3.Plugin.prototype);
        MoveAxis.prototype.constructor = MoveAxis;
        function MoveAxis(fig, props){
            mpld3.Plugin.call(this, fig, props);
        };

        MoveAxis.prototype.draw = function(){
            document.getElementsByClassName('mpld3-xaxis')[0].setAttribute('transform', 'translate(0,184.8)')
            document.getElementsByClassName('mpld3-yaxis')[0].setAttribute('transform', 'translate(248,0)')
            $("g[transform='translate(248.5,0)']").text("")
            $("g[transform='translate(0,185.3)']").text("")
            $("tspan[dy='11.015625']").attr('dy', "13.015625")
        }
        """

    def __init__(self):
        self.dict_ = {"type": "moveaxis"}


if __name__ == '__main__':
    app.run(debug=True)
